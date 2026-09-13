-- Refuerza el contrato posterior a la primera migración de pagos: cada
-- obligación requiere una categoría de gasto y reanudarla nunca recrea una
-- ocurrencia en una fecha ya vencida.
alter table public.recurring_payments
  alter column category_id set not null;

create or replace function public.pause_recurring_payment(p_payment_id uuid, p_active boolean)
returns public.recurring_payments
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  payment_row public.recurring_payments;
  candidate_due_date date;
  existing_due_date date;
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

  if not p_active then
    update public.recurring_payments
    set active = false
    where id = payment_row.id
    returning * into payment_row;
    return payment_row;
  end if;

  select due_date into existing_due_date
  from public.payment_occurrences
  where recurring_payment_id = payment_row.id
    and paid_at is null
    and status <> 'skipped'
    and due_date >= current_date
  order by due_date
  limit 1;

  candidate_due_date := coalesce(existing_due_date, payment_row.next_due_date);
  while candidate_due_date < current_date loop
    candidate_due_date := public.calculate_next_payment_due_date(
      candidate_due_date, payment_row.frequency, payment_row.billing_day, payment_row.custom_interval_days
    );
  end loop;

  update public.recurring_payments
  set active = true, next_due_date = candidate_due_date
  where id = payment_row.id
  returning * into payment_row;

  if existing_due_date is null then
    perform public.create_payment_occurrence(payment_row.id, candidate_due_date);
  end if;

  return payment_row;
end;
$$;

revoke all on function public.pause_recurring_payment(uuid, boolean) from public, anon;
grant execute on function public.pause_recurring_payment(uuid, boolean) to authenticated;
