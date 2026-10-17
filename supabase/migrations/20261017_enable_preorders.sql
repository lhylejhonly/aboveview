-- Allow customers to place preorder requests for products that are still coming soon.
-- Preorders do not reserve physical stock until the product is launched.

alter table public.orders add column if not exists is_preorder boolean not null default false;

create or replace function public.validate_customer_order_product()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  product_is_coming_soon boolean;
  available_size_stock integer;
begin
  select is_coming_soon,
    case when size_stock ? new.size then (size_stock->>new.size)::integer else stock_count end
    into product_is_coming_soon, available_size_stock
  from public.products where id = new.product_id for update;

  if not found then
    raise exception 'This product is not available for ordering.' using errcode = 'check_violation';
  end if;
  if product_is_coming_soon or new.is_preorder then return new; end if;
  if available_size_stock is null or new.quantity > available_size_stock then
    raise exception 'The requested quantity is not available.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create or replace function public.reserve_order_stock()
returns trigger language plpgsql security definer set search_path = public as $$
declare product_is_coming_soon boolean;
begin
  select is_coming_soon into product_is_coming_soon from public.products where id = new.product_id;
  if new.status <> 'cancelled' and new.is_preorder = false and coalesce(product_is_coming_soon, false) = false then
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
declare product_is_coming_soon boolean;
begin
  select is_coming_soon into product_is_coming_soon from public.products where id = coalesce(new.product_id, old.product_id);
  if old.is_preorder or new.is_preorder or coalesce(product_is_coming_soon, false) then return new; end if;
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
