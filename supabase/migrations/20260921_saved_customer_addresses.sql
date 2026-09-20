-- Shopee-style saved delivery addresses for each customer.
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  contact_number text not null,
  destination text not null,
  address text not null,
  delivery_notes text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_idx on public.customer_addresses(user_id, is_default desc, updated_at desc);
alter table public.customer_addresses enable row level security;

drop policy if exists "customers can view own addresses" on public.customer_addresses;
create policy "customers can view own addresses" on public.customer_addresses for select to authenticated using (user_id = auth.uid());
drop policy if exists "customers can create own addresses" on public.customer_addresses;
create policy "customers can create own addresses" on public.customer_addresses for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "customers can update own addresses" on public.customer_addresses;
create policy "customers can update own addresses" on public.customer_addresses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "customers can delete own addresses" on public.customer_addresses;
create policy "customers can delete own addresses" on public.customer_addresses for delete to authenticated using (user_id = auth.uid());

create or replace function public.ensure_default_customer_address()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_default then
    update public.customer_addresses set is_default = false where user_id = new.user_id and id <> new.id;
  elsif not exists (select 1 from public.customer_addresses where user_id = new.user_id and is_default and id <> new.id) then
    new.is_default := true;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists customer_addresses_default on public.customer_addresses;
create trigger customer_addresses_default before insert or update on public.customer_addresses
for each row execute function public.ensure_default_customer_address();
