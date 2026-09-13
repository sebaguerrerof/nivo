-- La eliminación explícitamente confirmada de una obligación también limpia
-- sus ocurrencias y exclusivamente los gastos automáticos enlazados a ellas.
-- Las transacciones manuales no pueden estar enlazadas por RLS/RPC y no se
-- seleccionan ni eliminan aquí.
create or replace function public.delete_recurring_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  payment_row public.recurring_payments;
  linked_transaction_ids uuid[];
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

  -- Bloquea las ocurrencias antes de desvincular sus transacciones automáticas.
  perform 1
  from public.payment_occurrences
  where recurring_payment_id = payment_row.id
  for update;

  select coalesce(array_agg(transaction_id), '{}'::uuid[])
  into linked_transaction_ids
  from public.payment_occurrences
  where recurring_payment_id = payment_row.id
    and transaction_id is not null;

  -- La FK tiene ON DELETE RESTRICT, por lo que se elimina el vínculo antes de
  -- borrar los gastos automáticos de Nivo y después la obligación en cascada.
  update public.payment_occurrences
  set transaction_id = null
  where recurring_payment_id = payment_row.id
    and transaction_id is not null;

  if cardinality(linked_transaction_ids) > 0 then
    delete from public.financial_transactions
    where user_id = actor_id
      and id = any(linked_transaction_ids);
  end if;

  delete from public.recurring_payments
  where id = payment_row.id and user_id = actor_id;
end;
$$;

revoke all on function public.delete_recurring_payment(uuid) from public, anon;
grant execute on function public.delete_recurring_payment(uuid) to authenticated;
