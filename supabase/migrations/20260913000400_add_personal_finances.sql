-- Fase 5: finanzas personales. Las operaciones financieras permanecen privadas
-- y todas las relaciones entre presupuesto, categoría y movimiento se validan
-- en la base de datos, además de las políticas RLS.

create table public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  type text not null check (type in ('income', 'expense')),
  icon text check (icon is null or char_length(icon) <= 80),
  is_system boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_categories_owner_kind_check check (
    (is_system and user_id is null) or (not is_system and user_id is not null)
  )
);

create unique index financial_categories_system_name_type_key
  on public.financial_categories (type, lower(name))
  where is_system;

create unique index financial_categories_personal_name_type_key
  on public.financial_categories (user_id, type, lower(name))
  where not is_system;

create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  category_id uuid references public.financial_categories(id) on delete restrict,
  description text not null check (char_length(btrim(description)) between 1 and 160),
  transaction_date date not null,
  payment_method text check (payment_method is null or char_length(btrim(payment_method)) between 1 and 60),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index financial_transactions_user_transaction_date_index
  on public.financial_transactions (user_id, transaction_date desc, created_at desc);

create index financial_transactions_user_type_transaction_date_index
  on public.financial_transactions (user_id, type, transaction_date desc);

create table public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null check (year between 2000 and 2200),
  month integer not null check (month between 1 and 12),
  amount numeric(14, 2) not null check (amount >= 0),
  savings_target numeric(14, 2) not null default 0 check (savings_target >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_budgets_user_year_month_key unique (user_id, year, month)
);

create index monthly_budgets_user_period_index
  on public.monthly_budgets (user_id, year, month);

create table public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  monthly_budget_id uuid not null references public.monthly_budgets(id) on delete cascade,
  category_id uuid not null references public.financial_categories(id) on delete restrict,
  amount numeric(14, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_budgets_monthly_budget_category_key unique (monthly_budget_id, category_id)
);

create index category_budgets_user_monthly_budget_index
  on public.category_budgets (user_id, monthly_budget_id);

create trigger financial_categories_set_updated_at
before update on public.financial_categories
for each row execute procedure public.set_updated_at();

create trigger financial_transactions_set_updated_at
before update on public.financial_transactions
for each row execute procedure public.set_updated_at();

create trigger monthly_budgets_set_updated_at
before update on public.monthly_budgets
for each row execute procedure public.set_updated_at();

create trigger category_budgets_set_updated_at
before update on public.category_budgets
for each row execute procedure public.set_updated_at();

-- Impide usar una categoría de otro usuario, una categoría del tipo opuesto o
-- una categoría desactivada en nuevos movimientos. Una categoría ya usada se
-- puede desactivar sin romper el historial.
create or replace function public.validate_financial_transaction_category()
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

  if category_row.type <> new.type then
    raise exception 'The category type must match the transaction type' using errcode = '23514';
  end if;

  if not category_row.is_system and category_row.user_id <> new.user_id then
    raise exception 'A transaction can only use an owned financial category' using errcode = '42501';
  end if;

  if not category_row.active and (tg_op = 'INSERT' or new.category_id is distinct from old.category_id) then
    raise exception 'An inactive financial category cannot be selected' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger financial_transactions_validate_category
before insert or update of user_id, type, category_id on public.financial_transactions
for each row execute procedure public.validate_financial_transaction_category();

-- Una categoría ya relacionada con movimientos no puede cambiar de tipo: eso
-- alteraría el significado histórico de ingresos y gastos existentes.
create or replace function public.protect_used_financial_category_type()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type is distinct from old.type and exists (
    select 1 from public.financial_transactions where category_id = old.id
  ) then
    raise exception 'A category with transactions cannot change type' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger financial_categories_protect_type
before update of type on public.financial_categories
for each row execute procedure public.protect_used_financial_category_type();

-- Valida las dos referencias del presupuesto por categoría. RLS impide ver
-- filas ajenas; este trigger además evita enlazarlas por conocer un UUID.
create or replace function public.validate_category_budget_references()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  budget_row public.monthly_budgets;
  category_row public.financial_categories;
begin
  select * into budget_row
  from public.monthly_budgets
  where id = new.monthly_budget_id;

  if not found or budget_row.user_id <> new.user_id then
    raise exception 'A category budget must belong to an owned monthly budget' using errcode = '42501';
  end if;

  select * into category_row
  from public.financial_categories
  where id = new.category_id;

  if not found then
    raise exception 'Financial category was not found' using errcode = '23503';
  end if;

  if category_row.type <> 'expense' then
    raise exception 'Only expense categories can have a category budget' using errcode = '23514';
  end if;

  if not category_row.is_system and category_row.user_id <> new.user_id then
    raise exception 'A category budget can only use an owned financial category' using errcode = '42501';
  end if;

  if not category_row.active and (tg_op = 'INSERT' or new.category_id is distinct from old.category_id) then
    raise exception 'An inactive financial category cannot be selected' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger category_budgets_validate_references
before insert or update of user_id, monthly_budget_id, category_id on public.category_budgets
for each row execute procedure public.validate_category_budget_references();

alter table public.financial_categories enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.category_budgets enable row level security;

create policy "financial_categories_select_system_or_own"
on public.financial_categories for select to authenticated
using (is_system or auth.uid() = user_id);

create policy "financial_categories_insert_own"
on public.financial_categories for insert to authenticated
with check (auth.uid() = user_id and not is_system);

create policy "financial_categories_update_own"
on public.financial_categories for update to authenticated
using (auth.uid() = user_id and not is_system)
with check (auth.uid() = user_id and not is_system);

create policy "financial_categories_delete_own"
on public.financial_categories for delete to authenticated
using (auth.uid() = user_id and not is_system);

create policy "financial_transactions_select_own"
on public.financial_transactions for select to authenticated
using (auth.uid() = user_id);

create policy "financial_transactions_insert_own"
on public.financial_transactions for insert to authenticated
with check (auth.uid() = user_id);

create policy "financial_transactions_update_own"
on public.financial_transactions for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "financial_transactions_delete_own"
on public.financial_transactions for delete to authenticated
using (auth.uid() = user_id);

create policy "monthly_budgets_select_own"
on public.monthly_budgets for select to authenticated
using (auth.uid() = user_id);

create policy "monthly_budgets_insert_own"
on public.monthly_budgets for insert to authenticated
with check (auth.uid() = user_id);

create policy "monthly_budgets_update_own"
on public.monthly_budgets for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "monthly_budgets_delete_own"
on public.monthly_budgets for delete to authenticated
using (auth.uid() = user_id);

create policy "category_budgets_select_own"
on public.category_budgets for select to authenticated
using (auth.uid() = user_id);

create policy "category_budgets_insert_own"
on public.category_budgets for insert to authenticated
with check (auth.uid() = user_id);

create policy "category_budgets_update_own"
on public.category_budgets for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "category_budgets_delete_own"
on public.category_budgets for delete to authenticated
using (auth.uid() = user_id);

-- El overview contiene solo agregados de auth.uid() y evita una consulta por
-- tarjeta o por gráfico. No recibe user_id desde el cliente.
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
  from totals;

  return payload;
end;
$$;

-- Categorías globales, creadas una sola vez para toda la instancia. El ON
-- CONFLICT sin target también mantiene segura una nueva ejecución local.
insert into public.financial_categories (name, type, icon, is_system)
values
  ('Alimentación', 'expense', 'utensils', true),
  ('Transporte', 'expense', 'car', true),
  ('Salud', 'expense', 'heart-pulse', true),
  ('Terapia', 'expense', 'heart-handshake', true),
  ('Deporte', 'expense', 'dumbbell', true),
  ('Vivienda', 'expense', 'house', true),
  ('Tecnología', 'expense', 'laptop', true),
  ('Entretenimiento', 'expense', 'film', true),
  ('Suscripciones', 'expense', 'repeat-2', true),
  ('Compras', 'expense', 'shopping-bag', true),
  ('Educación', 'expense', 'graduation-cap', true),
  ('Otros', 'expense', 'shapes', true),
  ('Sueldo', 'income', 'briefcase-business', true),
  ('Clases', 'income', 'book-open-check', true),
  ('Freelance', 'income', 'laptop-minimal', true),
  ('Empresa', 'income', 'building-2', true),
  ('Venta', 'income', 'store', true),
  ('Otro', 'income', 'circle-dollar-sign', true)
on conflict do nothing;

revoke all on public.financial_categories, public.financial_transactions, public.monthly_budgets, public.category_budgets from anon, authenticated;
grant select, delete on public.financial_categories, public.financial_transactions, public.monthly_budgets, public.category_budgets to authenticated;
grant insert (user_id, name, type, icon, active) on public.financial_categories to authenticated;
grant update (name, type, icon, active) on public.financial_categories to authenticated;
grant insert (user_id, type, amount, category_id, description, transaction_date, payment_method, notes) on public.financial_transactions to authenticated;
grant update (type, amount, category_id, description, transaction_date, payment_method, notes) on public.financial_transactions to authenticated;
grant insert (user_id, year, month, amount, savings_target) on public.monthly_budgets to authenticated;
grant update (year, month, amount, savings_target) on public.monthly_budgets to authenticated;
grant insert (user_id, monthly_budget_id, category_id, amount) on public.category_budgets to authenticated;
grant update (monthly_budget_id, category_id, amount) on public.category_budgets to authenticated;

revoke execute on function public.validate_financial_transaction_category() from public, anon, authenticated;
revoke execute on function public.protect_used_financial_category_type() from public, anon, authenticated;
revoke execute on function public.validate_category_budget_references() from public, anon, authenticated;
revoke all on function public.get_financial_month_overview(integer, integer) from public, anon;
grant execute on function public.get_financial_month_overview(integer, integer) to authenticated;
