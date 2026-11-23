-- Customer-uploaded COD deposit receipts are stored privately and reviewed by admins.
alter table public.orders add column if not exists receipt_path text;

insert into storage.buckets (id, name, public)
values ('order-receipts', 'order-receipts', false)
on conflict (id) do update set public = false;

drop policy if exists "customers can upload own order receipts" on storage.objects;
create policy "customers can upload own order receipts"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'order-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

notify pgrst, 'reload schema';
