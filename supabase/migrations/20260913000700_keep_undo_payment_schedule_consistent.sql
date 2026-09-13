-- Deshacer un pago debe devolver el calendario al mismo estado previo: además
-- de borrar el gasto automático, retira la siguiente ocurrencia sin pagar que
-- fue creada por la confirmación original.
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
  generated_next_due_date date;
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
  generated_next_due_date := public.calculate_next_payment_due_date(
    occurrence_row.due_date, payment_row.frequency, payment_row.billing_day, payment_row.custom_interval_days
  );

  update public.payment_occurrences
  set amount = payment_row.amount,
      status = public.get_payment_occurrence_status(occurrence_row.due_date, null, 'upcoming'),
      paid_at = null, payment_method = null, notes = null, transaction_id = null
  where id = occurrence_row.id
  returning * into occurrence_row;

  if linked_transaction_id is not null then
    delete from public.financial_transactions
    where id = linked_transaction_id and user_id = actor_id;
  end if;

  -- No tocamos historial ni una ocurrencia que alguien ya haya editado o
  -- pagado; únicamente la próxima fila automática, aún vacía, creada al pagar.
  delete from public.payment_occurrences
  where recurring_payment_id = payment_row.id
    and due_date = generated_next_due_date
    and paid_at is null
    and transaction_id is null
    and payment_method is null
    and notes is null
    and status <> 'skipped';

  update public.recurring_payments
  set next_due_date = occurrence_row.due_date
  where id = payment_row.id;

  return occurrence_row;
end;
$$;

revoke all on function public.undo_payment_occurrence(uuid) from public, anon;
grant execute on function public.undo_payment_occurrence(uuid) to authenticated;
