-- J&T shipping data for the existing order flow.
-- Safe to run more than once; legacy orders receive the defaults below.

alter table public.orders add column if not exists province text not null default '';
alter table public.orders add column if not exists city_municipality text not null default '';
alter table public.orders add column if not exists barangay text not null default '';
alter table public.orders add column if not exists postal_code text not null default '';
alter table public.orders add column if not exists package_weight_kg numeric(8, 3) not null default 0.5;
alter table public.orders add column if not exists cod_amount numeric(12, 2) not null default 0;

alter table public.orders drop constraint if exists orders_package_weight_kg_check;
alter table public.orders add constraint orders_package_weight_kg_check check (package_weight_kg > 0);
alter table public.orders drop constraint if exists orders_cod_amount_check;
alter table public.orders add constraint orders_cod_amount_check check (cod_amount >= 0);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  courier text not null default 'jnt_express',
  tracking_number text,
  waybill_url text,
  shipment_status text not null default 'not_created' check (shipment_status in ('not_created', 'creating', 'created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'failed')),
  waybill_status text,
  jnt_shipment_id text,
  shipping_fee numeric(12, 2),
  weight_kg numeric(8, 3) not null check (weight_kg > 0),
  api_response jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_tracking_number_idx on public.shipments(tracking_number);
create index if not exists shipments_status_idx on public.shipments(shipment_status);
create index if not exists shipments_order_id_idx on public.shipments(order_id);

alter table public.shipments enable row level security;
drop policy if exists "customers can view own shipments" on public.shipments;
create policy "customers can view own shipments" on public.shipments
  for select to authenticated
  using (exists (select 1 from public.orders where orders.id = shipments.order_id and orders.user_id = auth.uid()));

drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at
before update on public.shipments
for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
