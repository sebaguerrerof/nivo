-- Un pago sin historial financiero puede eliminarse completamente. Si ya fue
-- pagado, se conserva como historial y el usuario debe archivarlo/pausarlo.
create or replace function public.delete_recurring_payment(p_payment_id uuid)
returns void
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

  select * into payment_row
  from public.recurring_payments
  where id = p_payment_id and user_id = actor_id
  for update;

  if not found then
    raise exception 'Recurring payment was not found' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.payment_occurrences
    where recurring_payment_id = payment_row.id
      and (paid_at is not null or transaction_id is not null)
  ) then
    raise exception 'Payments with financial history must be archived instead of deleted' using errcode = 'P0001';
  end if;

  delete from public.recurring_payments
  where id = payment_row.id and user_id = actor_id;
end;
$$;

revoke all on function public.delete_recurring_payment(uuid) from public, anon;
grant execute on function public.delete_recurring_payment(uuid) to authenticated;
