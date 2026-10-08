-- Above Viewing catalog schema
-- Run this once in Supabase SQL Editor.

create table if not exists public.categories (
  id text primary key,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  code text not null,
  category text not null,
  price numeric(12, 2) not null default 0,
  original_price numeric(12, 2),
  currency text not null default '₱',
  description text not null default '',
  front_image text not null default '',
  back_image text not null default '',
  front_feature_highlight text,
  back_feature_highlight text,
  fabric_details text not null default '',
  gsm integer not null default 0,
  fit_type text not null default '',
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  tiktok_shop_url text not null default '',
  stock_count integer not null default 0,
  rating numeric(3, 2) not null default 5,
  review_count integer not null default 0,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  is_coming_soon boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists is_coming_soon boolean not null default false;

create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);

create table if not exists public.vouchers (
  id text primary key,
  code text not null unique,
  discount_percent numeric(5, 2) not null check (discount_percent > 0 and discount_percent <= 100),
  is_active boolean not null default true,
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vouchers enable row level security;
drop policy if exists "public can view active voucher" on public.vouchers;
create policy "public can view active voucher" on public.vouchers for select to anon, authenticated using (is_active = true);

insert into public.vouchers (id, code, discount_percent, is_active)
values ('current', '10.10', 10, true)
on conflict (id) do nothing;

drop trigger if exists vouchers_set_updated_at on public.vouchers;
create trigger vouchers_set_updated_at before update on public.vouchers for each row execute function public.set_updated_at();

create or replace function public.consume_voucher()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.voucher_code is null or btrim(new.voucher_code) = '' then return new; end if;
  new.voucher_code = upper(btrim(new.voucher_code));
  update public.vouchers set used_count = used_count + 1
  where id = 'current' and code = new.voucher_code and is_active = true
    and (expires_at is null or expires_at >= now())
    and (usage_limit is null or used_count < usage_limit);
  if not found then raise exception 'Voucher is invalid, expired, or fully redeemed.' using errcode = 'check_violation'; end if;
  return new;
end;
$$;

drop trigger if exists orders_consume_voucher on public.orders;
create trigger orders_consume_voucher before insert on public.orders for each row execute function public.consume_voucher();

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', contact_number text not null default '', destination text not null default '',
  address text not null default '', delivery_notes text not null default '', updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id text not null references public.products(id) on delete restrict,
  product_name text not null, product_code text not null, size text not null,
  quantity integer not null check (quantity > 0), unit_price numeric(12, 2) not null check (unit_price >= 0),
  voucher_code text, discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  full_name text not null, contact_number text not null, destination text not null, address text not null,
  delivery_notes text not null default '', status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
drop policy if exists "customers can view own profile" on public.customer_profiles;
drop policy if exists "customers can insert own profile" on public.customer_profiles;
drop policy if exists "customers can update own profile" on public.customer_profiles;
create policy "customers can view own profile" on public.customer_profiles for select to authenticated using (id = auth.uid());
create policy "customers can insert own profile" on public.customer_profiles for insert to authenticated with check (id = auth.uid());
create policy "customers can update own profile" on public.customer_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "customers can view own orders" on public.orders;
drop policy if exists "customers can create own orders" on public.orders;
create policy "customers can view own orders" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "customers can create own orders" on public.orders for insert to authenticated with check (user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "product image read access" on storage.objects;
drop policy if exists "product image upload access" on storage.objects;
drop policy if exists "product image update access" on storage.objects;
drop policy if exists "product image delete access" on storage.objects;
create policy "product image read access" on storage.objects for select to anon, authenticated using (bucket_id = 'products');
-- Writes are performed by the server using the Supabase service role key.

-- Public users can read the catalog. Admin writes go through protected server routes.
alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "catalog read access" on public.categories;
drop policy if exists "product read access" on public.products;
create policy "catalog read access" on public.categories for select to anon, authenticated using (true);
create policy "product read access" on public.products for select to anon, authenticated using (true);
