-- Al purgar una obligación confirmada no se deben modificar parcialmente las
-- ocurrencias pagadas: la restricción exige que estado, fecha y transacción
-- permanezcan coherentes. Se eliminan primero las filas que contienen el
-- vínculo, después los gastos automáticos asociados y finalmente el pago.
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

  perform 1
  from public.payment_occurrences
  where recurring_payment_id = payment_row.id
  for update;

  select coalesce(array_agg(transaction_id), '{}'::uuid[])
  into linked_transaction_ids
  from public.payment_occurrences
  where recurring_payment_id = payment_row.id
    and transaction_id is not null;

  -- Borrar la fila que referencia el gasto evita una actualización inválida
  -- (por ejemplo, status = 'paid' sin transaction_id) y libera la FK.
  delete from public.payment_occurrences
  where recurring_payment_id = payment_row.id;

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