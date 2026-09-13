-- Fase 6: obligaciones recurrentes y sus ocurrencias. Las escrituras se
-- concentran en RPCs con auth.uid() para crear o revertir el gasto financiero
-- de forma atómica e idempotente.

create table public.recurring_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  category_id uuid references public.financial_categories(id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly', 'custom')),
  billing_day integer check (billing_day is null or billing_day between 1 and 31),
  custom_interval_days integer check (custom_interval_days is null or custom_interval_days between 1 and 3650),
  start_date date not null,
  next_due_date date not null,
  reminder_days jsonb not null default '[7, 3, 1, 0]'::jsonb check (jsonb_typeof(reminder_days) = 'array'),
  active boolean not null default true,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_payments_custom_frequency_check check (
    (frequency = 'custom' and custom_interval_days is not null)
    or (frequency <> 'custom' and custom_interval_days is null)
  )
);

create table public.payment_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recurring_payment_id uuid not null references public.recurring_payments(id) on delete cascade,
  due_date date not null,
  amount numeric(14, 2) not null check (amount > 0),
  status text not null default 'upcoming' check (status in ('upcoming', 'pending', 'paid', 'overdue', 'skipped')),
  paid_at timestamptz,
  payment_method text check (payment_method is null or char_length(btrim(payment_method)) between 1 and 60),
  transaction_id uuid unique references public.financial_transactions(id) on delete restrict,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_occurrences_payment_due_key unique (recurring_payment_id, due_date),
  constraint payment_occurrences_paid_state_check check (
    (status = 'paid' and paid_at is not null and transaction_id is not null)
    or (status <> 'paid')
  )
);

create index recurring_payments_user_active_next_due_index
  on public.recurring_payments (user_id, active, next_due_date);

create index payment_occurrences_user_due_status_index
  on public.payment_occurrences (user_id, due_date, status);

create index payment_occurrences_payment_due_index
  on public.payment_occurrences (recurring_payment_id, due_date desc);

create trigger recurring_payments_set_updated_at
before update on public.recurring_payments
for each row execute procedure public.set_updated_at();

create trigger payment_occurrences_set_updated_at
before update on public.payment_occurrences
for each row execute procedure public.set_updated_at();

-- Estado efectivo centralizado. El status guardado sirve como historial, pero
-- la fecha actual determina automáticamente próximo, hoy o vencido.
create or replace function public.get_payment_occurrence_status(
  p_due_date date,
  p_paid_at timestamptz,
  p_stored_status text,
  p_today date default current_date
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_paid_at is not null or p_stored_status = 'paid' then
    return 'paid';
  end if;

  if p_stored_status = 'skipped' then
    return 'skipped';
  end if;

  if p_today > p_due_date then
    return 'overdue';
  end if;

  if p_today = p_due_date then
    return 'pending';
  end if;

  return 'upcoming';
end;
$$;

-- Una categoría de pago siempre debe ser una categoría de gasto del sistema o
-- de la misma persona. Esta protección no depende del formulario.
create or replace function public.validate_recurring_payment_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  category_row public.financial_categories;
begin
  if new.category_id is null then
    return new;
  end if;

  select * into category_row
  from public.financial_categories
  where id = new.category_id;

  if not found then
    raise exception 'Financial category was not found' using errcode = '23503';
  end if;

  if category_row.type <> 'expense' then
    raise exception 'A recurring payment requires an expense category' using errcode = '23514';
  end if;

  if not category_row.is_system and category_row.user_id <> new.user_id then
    raise exception 'A recurring payment can only use an owned financial category' using errcode = '42501';
  end if;

  if not category_row.active and (tg_op = 'INSERT' or new.category_id is distinct from old.category_id) then
    raise exception 'An inactive financial category cannot be selected' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger recurring_payments_validate_category
before insert or update of user_id, category_id on public.recurring_payments
for each row execute procedure public.validate_recurring_payment_category();

-- Las ocurrencias deben pertenecer al mismo dueño que la obligación. Mantiene
-- la integridad incluso si alguien intenta enlazar UUIDs ajenos directamente.
create or replace function public.validate_payment_occurrence_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.recurring_payments;
begin
  select * into payment_row
  from public.recurring_payments
  where id = new.recurring_payment_id;

  if not found or payment_row.user_id <> new.user_id then
    raise exception 'A payment occurrence must belong to an owned recurring payment' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger payment_occurrences_validate_payment
before insert or update of user_id, recurring_payment_id on public.payment_occurrences
for each row execute procedure public.validate_payment_occurrence_payment();

create or replace function public.calculate_next_payment_due_date(
  p_due_date date,
  p_frequency text,
  p_billing_day integer,
  p_custom_interval_days integer
)
returns date
language plpgsql
immutable
security invoker
set search_path = public
as $$
declare
  next_month date;
  requested_day integer;
  last_day integer;
begin
  if p_frequency = 'weekly' then
    return p_due_date + 7;
  end if;

  if p_frequency = 'biweekly' then
    return p_due_date + 14;
  end if;

  if p_frequency = 'custom' then
    if p_custom_interval_days is null or p_custom_interval_days < 1 then
      raise exception 'Custom payments require a positive interval' using errcode = '23514';
    end if;
    return p_due_date + p_custom_interval_days;
  end if;

  if p_frequency <> 'monthly' then
    raise exception 'Unsupported payment frequency' using errcode = '23514';
  end if;

  next_month := (date_trunc('month', p_due_date)::date + interval '1 month')::date;
  requested_day := coalesce(p_billing_day, extract(day from p_due_date)::integer);
  last_day := extract(day from (next_month + interval '1 month - 1 day'))::integer;
  return make_date(extract(year from next_month)::integer, extract(month from next_month)::integer, least(requested_day, last_day));
end;
$$;

create or replace function public.create_payment_occurrence(
  p_recurring_payment_id uuid,
  p_due_date date
)
returns public.payment_occurrences
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.recurring_payments;
  occurrence_row public.payment_occurrences;
begin
  select * into payment_row
  from public.recurring_payments
  where id = p_recurring_payment_id;

  if not found then
    raise exception 'Recurring payment was not found' using errcode = 'P0002';
  end if;

  insert into public.payment_occurrences (user_id, recurring_payment_id, due_date, amount, status)
  values (
    payment_row.user_id,
    payment_row.id,
    p_due_date,
    payment_row.amount,
    public.get_payment_occurrence_status(p_due_date, null, 'upcoming')
  )
  on conflict (recurring_payment_id, due_date) do update
  set recurring_payment_id = excluded.recurring_payment_id
  returning * into occurrence_row;

  return occurrence_row;
end;
$$;

create or replace function public.create_recurring_payment(
  p_name text,
  p_amount numeric,
  p_category_id uuid,
  p_frequency text,
  p_billing_day integer,
  p_start_date date,
  p_next_due_date date,
  p_reminder_days jsonb,
  p_custom_interval_days integer,
  p_notes text
)
returns public.recurring_payments
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  payment_row public.recurring_payments;
  effective_billing_day integer;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  effective_billing_day := case when p_frequency = 'monthly' then coalesce(p_billing_day, extract(day from p_start_date)::integer) else null end;

  insert into public.recurring_payments (
    user_id, name, amount, category_id, frequency, billing_day, custom_interval_days,
    start_date, next_due_date, reminder_days, notes
  ) values (
    actor_id, btrim(p_name), p_amount, p_category_id, p_frequency, effective_billing_day,
    case when p_frequency = 'custom' then p_custom_interval_days else null end,
    p_start_date, p_next_due_date, coalesce(p_reminder_days, '[7, 3, 1, 0]'::jsonb), nullif(btrim(p_notes), '')
  ) returning * into payment_row;

  perform public.create_payment_occurrence(payment_row.id, payment_row.next_due_date);
  return payment_row;
end;
$$;

-- Edita solo la obligación y, si existe, su próxima ocurrencia futura. Los
-- registros pagados y vencidos se conservan como historial intacto.
create or replace function public.update_recurring_payment(
  p_payment_id uuid,
  p_name text,
  p_amount numeric,
  p_category_id uuid,
  p_frequency text,
  p_billing_day integer,
  p_next_due_date date,
  p_reminder_days jsonb,
  p_custom_interval_days integer,
  p_notes text,
  p_active boolean
)
returns public.recurring_payments
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  payment_row public.recurring_payments;
  occurrence_id uuid;
  effective_billing_day integer;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  select * into payment_row
  from public.recurring_payments
  where id = p_payment_id and user_id = actor_id
  for update;

  if not found then
    raise exception 'Recurring payment was not found' using errcode = 'P0002';
  end if;

  effective_billing_day := case when p_frequency = 'monthly' then coalesce(p_billing_day, payment_row.billing_day, extract(day from p_next_due_date)::integer) else null end;

  update public.recurring_payments
  set name = btrim(p_name), amount = p_amount, category_id = p_category_id,
      frequency = p_frequency, billing_day = effective_billing_day,
      custom_interval_days = case when p_frequency = 'custom' then p_custom_interval_days else null end,
      next_due_date = p_next_due_date, reminder_days = coalesce(p_reminder_days, reminder_days),
      notes = nullif(btrim(p_notes), ''), active = p_active
  where id = payment_row.id
  returning * into payment_row;

  select id into occurrence_id
  from public.payment_occurrences
  where recurring_payment_id = payment_row.id
    and paid_at is null
    and status <> 'skipped'
    and due_date >= current_date
  order by due_date
  limit 1
  for update;

  if occurrence_id is not null then
    update public.payment_occurrences
    set due_date = p_next_due_date, amount = p_amount,
        status = public.get_payment_occurrence_status(p_next_due_date, null, 'upcoming')
    where id = occurrence_id;
  elsif p_active then
    perform public.create_payment_occurrence(payment_row.id, p_next_due_date);
  end if;

  return payment_row;
end;
$$;

create or replace function public.pause_recurring_payment(p_payment_id uuid, p_active boolean)
returns public.recurring_payments
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  payment_row public.recurring_payments;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  update public.recurring_payments
  set active = p_active
  where id = p_payment_id and user_id = actor_id
  returning * into payment_row;

  if not found then
    raise exception 'Recurring payment was not found' using errcode = 'P0002';
  end if;

  return payment_row;
end;
$$;

-- Bloquea la ocurrencia, inserta el gasto y genera una única siguiente fecha.
-- Un segundo click ve paid_at y retorna sin insertar otra transacción.
create or replace function public.mark_payment_occurrence_paid(
  p_occurrence_id uuid,
  p_amount numeric,
  p_paid_date date,
  p_payment_method text,
  p_notes text
)
returns public.payment_occurrences
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  occurrence_row public.payment_occurrences;
  payment_row public.recurring_payments;
  transaction_row public.financial_transactions;
  calculated_next_due_date date;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  select * into occurrence_row
  from public.payment_occurrences
  where id = p_occurrence_id and user_id = actor_id
  for update;

  if not found then
    raise exception 'Payment occurrence was not found' using errcode = 'P0002';
  end if;

  if occurrence_row.paid_at is not null then
    return occurrence_row;
  end if;

  if occurrence_row.status = 'skipped' then
    raise exception 'A skipped payment cannot be marked as paid' using errcode = '23514';
  end if;

  if p_amount is null or p_amount <= 0 or p_paid_date is null then
    raise exception 'A positive amount and paid date are required' using errcode = '23514';
  end if;

  select * into payment_row
  from public.recurring_payments
  where id = occurrence_row.recurring_payment_id and user_id = actor_id
  for update;

  if not found then
    raise exception 'Recurring payment was not found' using errcode = 'P0002';
  end if;

  insert into public.financial_transactions (
    user_id, type, amount, category_id, description, transaction_date, payment_method, notes
  ) values (
    actor_id, 'expense', p_amount, payment_row.category_id,
    'Pago: ' || payment_row.name, p_paid_date, nullif(btrim(p_payment_method), ''), nullif(btrim(p_notes), '')
  ) returning * into transaction_row;

  update public.payment_occurrences
  set amount = p_amount, status = 'paid',
      paid_at = (p_paid_date::text || ' 12:00:00+00')::timestamptz,
      payment_method = nullif(btrim(p_payment_method), ''), notes = nullif(btrim(p_notes), ''),
      transaction_id = transaction_row.id
  where id = occurrence_row.id
  returning * into occurrence_row;

  calculated_next_due_date := public.calculate_next_payment_due_date(
    occurrence_row.due_date, payment_row.frequency, payment_row.billing_day, payment_row.custom_interval_days
  );

  if payment_row.active then
    perform public.create_payment_occurrence(payment_row.id, calculated_next_due_date);
    update public.recurring_payments
    set next_due_date = calculated_next_due_date
    where id = payment_row.id;
  end if;

  return occurrence_row;
end;
$$;

-- Solo se borra la transacción que el RPC creó y que está enlazada a esta
-- ocurrencia; una transacción manual nunca puede quedar afectada.
create or replace function public.undo_payment_occurrence(p_occurrence_id uuid)
returns public.payment_occurrences
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  occurrence_row public.payment_occurrences;
  payment_row public.recurring_payments;
  linked_transaction_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  select * into occurrence_row
  from public.payment_occurrences
  where id = p_occurrence_id and user_id = actor_id
  for update;

  if not found then
    raise exception 'Payment occurrence was not found' using errcode = 'P0002';
  end if;

  if occurrence_row.paid_at is null then
    return occurrence_row;
  end if;

  select * into payment_row
  from public.recurring_payments
  where id = occurrence_row.recurring_payment_id and user_id = actor_id
  for update;

  linked_transaction_id := occurrence_row.transaction_id;

  update public.payment_occurrences
  set amount = payment_row.amount,
      status = public.get_payment_occurrence_status(occurrence_row.due_date, null, 'upcoming'),
      paid_at = null, payment_method = null, notes = null, transaction_id = null
  where id = occurrence_row.id
  returning * into occurrence_row;

  -- La FK de la ocurrencia protege la transacción. Primero se elimina el
  -- vínculo y luego se borra exclusivamente el gasto que creó este RPC.
  if linked_transaction_id is not null then
    delete from public.financial_transactions
    where id = linked_transaction_id and user_id = actor_id;
  end if;

  update public.recurring_payments
  set next_due_date = occurrence_row.due_date
  where id = payment_row.id;

  return occurrence_row;
end;
$$;

alter table public.recurring_payments enable row level security;
alter table public.payment_occurrences enable row level security;

create policy "recurring_payments_select_own"
on public.recurring_payments for select to authenticated
using (auth.uid() = user_id);

create policy "recurring_payments_insert_own"
on public.recurring_payments for insert to authenticated
with check (auth.uid() = user_id);

create policy "recurring_payments_update_own"
on public.recurring_payments for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "recurring_payments_delete_own"
on public.recurring_payments for delete to authenticated
using (auth.uid() = user_id);

create policy "payment_occurrences_select_own"
on public.payment_occurrences for select to authenticated
using (auth.uid() = user_id);

create policy "payment_occurrences_insert_own_payment"
on public.payment_occurrences for insert to authenticated
with check (
  auth.uid() = user_id and exists (
    select 1 from public.recurring_payments payment
    where payment.id = recurring_payment_id and payment.user_id = auth.uid()
  )
);

create policy "payment_occurrences_update_own_payment"
on public.payment_occurrences for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id and exists (
    select 1 from public.recurring_payments payment
    where payment.id = recurring_payment_id and payment.user_id = auth.uid()
  )
);

create policy "payment_occurrences_delete_own"
on public.payment_occurrences for delete to authenticated
using (auth.uid() = user_id);

-- Las tablas son legibles bajo RLS; las mutaciones ocurren exclusivamente por
-- RPCs que validan auth.uid(), referencias y la transacción financiera.
revoke all on public.recurring_payments, public.payment_occurrences from anon, authenticated;
grant select on public.recurring_payments, public.payment_occurrences to authenticated;

revoke execute on function public.validate_recurring_payment_category() from public, anon, authenticated;
revoke execute on function public.validate_payment_occurrence_payment() from public, anon, authenticated;
revoke execute on function public.create_payment_occurrence(uuid, date) from public, anon, authenticated;
revoke all on function public.get_payment_occurrence_status(date, timestamptz, text, date) from public, anon;
grant execute on function public.get_payment_occurrence_status(date, timestamptz, text, date) to authenticated;
revoke all on function public.calculate_next_payment_due_date(date, text, integer, integer) from public, anon;
grant execute on function public.calculate_next_payment_due_date(date, text, integer, integer) to authenticated;
revoke all on function public.create_recurring_payment(text, numeric, uuid, text, integer, date, date, jsonb, integer, text) from public, anon;
grant execute on function public.create_recurring_payment(text, numeric, uuid, text, integer, date, date, jsonb, integer, text) to authenticated;
revoke all on function public.update_recurring_payment(uuid, text, numeric, uuid, text, integer, date, jsonb, integer, text, boolean) from public, anon;
grant execute on function public.update_recurring_payment(uuid, text, numeric, uuid, text, integer, date, jsonb, integer, text, boolean) to authenticated;
-- El resumen financiero distingue entre gastos ya registrados y compromisos
-- futuros. Las ocurrencias pagadas ya tienen una transacción y no se suman otra vez.
create or replace function public.get_financial_month_overview(
  p_year integer,
  p_month integer
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  period_start date;
  period_end date;
  payload jsonb;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  if p_year not between 2000 and 2200 or p_month not between 1 and 12 then
    raise exception 'Invalid financial month' using errcode = '22007';
  end if;

  period_start := make_date(p_year, p_month, 1);
  period_end := (period_start + interval '1 month - 1 day')::date;

  with
    month_transactions as (
      select id, type, amount, category_id, transaction_date
      from public.financial_transactions
      where user_id = actor_id and transaction_date between period_start and period_end
    ),
    totals as (
      select
        coalesce(sum(amount) filter (where type = 'income'), 0)::numeric as income_total,
        coalesce(sum(amount) filter (where type = 'expense'), 0)::numeric as expense_total
      from month_transactions
    ),
    committed_payments as (
      select coalesce(sum(amount), 0)::numeric as committed_pending
      from public.payment_occurrences
      where user_id = actor_id
        and due_date between period_start and period_end
        and paid_at is null
        and status <> 'skipped'
    ),
    current_budget as (
      select id, amount, savings_target
      from public.monthly_budgets
      where user_id = actor_id and year = p_year and month = p_month
    ),
    category_spend as (
      select
        transaction.category_id,
        coalesce(category.name, 'Sin categoría') as category_name,
        category.icon,
        sum(transaction.amount)::numeric as amount
      from month_transactions transaction
      left join public.financial_categories category on category.id = transaction.category_id
      where transaction.type = 'expense'
      group by transaction.category_id, category.name, category.icon
    ),
    daily_expenses as (
      select transaction_date, sum(amount)::numeric as amount
      from month_transactions
      where type = 'expense'
      group by transaction_date
    ),
    cumulative_expenses as (
      select
        transaction_date,
        amount,
        sum(amount) over (order by transaction_date rows unbounded preceding)::numeric as cumulative_amount
      from daily_expenses
    ),
    category_budget_stats as (
      select
        category_budget.id,
        category_budget.category_id,
        category.name as category_name,
        category.icon,
        category_budget.amount,
        coalesce(sum(transaction.amount), 0)::numeric as spent
      from public.category_budgets category_budget
      inner join current_budget budget on budget.id = category_budget.monthly_budget_id
      inner join public.financial_categories category on category.id = category_budget.category_id
      left join month_transactions transaction
        on transaction.category_id = category_budget.category_id and transaction.type = 'expense'
      where category_budget.user_id = actor_id
      group by category_budget.id, category_budget.category_id, category.name, category.icon, category_budget.amount
    )
  select jsonb_build_object(
    'incomeTotal', totals.income_total,
    'expenseTotal', totals.expense_total,
    'balance', totals.income_total - totals.expense_total,
    'committedPending', committed_payments.committed_pending,
    'availableReal', totals.income_total - totals.expense_total - committed_payments.committed_pending,
    'budget', (
      select jsonb_build_object('id', id, 'amount', amount, 'savingsTarget', savings_target)
      from current_budget
    ),
    'expenseByCategory', coalesce((
      select jsonb_agg(jsonb_build_object(
        'categoryId', category_id,
        'categoryName', category_name,
        'icon', icon,
        'amount', amount
      ) order by amount desc, category_name)
      from category_spend
    ), '[]'::jsonb),
    'cumulativeExpenses', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', transaction_date,
        'amount', amount,
        'cumulativeAmount', cumulative_amount
      ) order by transaction_date)
      from cumulative_expenses
    ), '[]'::jsonb),
    'categoryBudgets', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'categoryId', category_id,
        'categoryName', category_name,
        'icon', icon,
        'amount', amount,
        'spent', spent
      ) order by category_name)
      from category_budget_stats
    ), '[]'::jsonb)
  ) into payload
  from totals, committed_payments;

  return payload;
end;
$$;

revoke all on function public.get_financial_month_overview(integer, integer) from public, anon;
grant execute on function public.get_financial_month_overview(integer, integer) to authenticated;
revoke all on function public.pause_recurring_payment(uuid, boolean) from public, anon;
grant execute on function public.pause_recurring_payment(uuid, boolean) to authenticated;
revoke all on function public.mark_payment_occurrence_paid(uuid, numeric, date, text, text) from public, anon;
grant execute on function public.mark_payment_occurrence_paid(uuid, numeric, date, text, text) to authenticated;
revoke all on function public.undo_payment_occurrence(uuid) from public, anon;
grant execute on function public.undo_payment_occurrence(uuid) to authenticated;
