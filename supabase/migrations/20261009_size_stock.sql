-- Per-size product inventory. Empty size_stock keeps legacy total-stock behavior.
alter table public.products add column if not exists size_stock jsonb not null default '{}'::jsonb;

create or replace function public.validate_customer_order_product()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  product_available boolean;
  available_stock integer;
  configured_size_stock boolean;
begin
  select (not is_coming_soon),
         case when size_stock ? new.size then (size_stock->>new.size)::integer else stock_count end,
         size_stock ? new.size
    into product_available, available_stock, configured_size_stock
  from public.products where id = new.product_id for update;
  if product_available is not true or available_stock is null then raise exception 'This product is not available for ordering.'; end if;
  if new.quantity > available_stock then raise exception 'The requested quantity is not available for this size.'; end if;
  return new;
end;
$$;

create or replace function public.reserve_order_stock()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'cancelled' then
    update public.products
    set stock_count = stock_count - new.quantity,
        size_stock = case when size_stock ? new.size
          then jsonb_set(size_stock, array[new.size], to_jsonb(greatest(0, (size_stock->>new.size)::integer - new.quantity)), true)
          else size_stock end
    where id = new.product_id;
  end if;
  return new;
end;
$$;

create or replace function public.restore_cancelled_order_stock()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status <> 'cancelled' and new.status = 'cancelled' then
    update public.products
    set stock_count = stock_count + old.quantity,
        size_stock = case when size_stock ? old.size
          then jsonb_set(size_stock, array[old.size], to_jsonb((size_stock->>old.size)::integer + old.quantity), true)
          else size_stock end
    where id = old.product_id;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    update public.products
    set stock_count = greatest(0, stock_count - new.quantity),
        size_stock = case when size_stock ? new.size
          then jsonb_set(size_stock, array[new.size], to_jsonb(greatest(0, (size_stock->>new.size)::integer - new.quantity)), true)
          else size_stock end
    where id = new.product_id;
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';
