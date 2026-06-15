create extension if not exists "uuid-ossp";

create table if not exists visits (
  id          uuid        primary key default uuid_generate_v4(),
  page        text        not null,
  timestamp   timestamptz not null default now(),
  user_agent  text,
  ip_address  text,
  session_id  text        not null,
  referrer    text
);

create index if not exists visits_timestamp_idx  on visits (timestamp desc);
create index if not exists visits_session_id_idx on visits (session_id);
create index if not exists visits_page_idx       on visits (page);

create table if not exists active_users (
  id          uuid        primary key default uuid_generate_v4(),
  session_id  text        unique not null,
  last_seen   timestamptz not null default now()
);

create index if not exists active_users_last_seen_idx on active_users (last_seen desc);

create table if not exists orders (
  id                         uuid        primary key default uuid_generate_v4(),
  order_number               text        unique not null,
  customer_name              text        not null,
  customer_email             text,
  customer_phone             text        not null,
  delivery_address           text        not null,
  payment_method             text        not null,
  payment_status             text        not null default 'pending',
  fulfillment_status         text        not null default 'pending',
  subtotal                   numeric     not null default 0,
  delivery_fee               numeric     not null default 0,
  total                      numeric     not null default 0,
  items                      jsonb       not null default '[]'::jsonb,
  payment_reference          text,
  paystack_authorization_url text,
  notes                      text,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint orders_payment_method_check check (payment_method in ('card', 'paystack', 'bank_transfer', 'pay_on_delivery')),
  constraint orders_payment_status_check check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  constraint orders_fulfillment_status_check check (fulfillment_status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_order_number_idx on orders (order_number);
create index if not exists orders_payment_status_idx on orders (payment_status);
create index if not exists orders_fulfillment_status_idx on orders (fulfillment_status);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on orders;
create trigger set_orders_updated_at
before update on orders
for each row
execute function set_updated_at();

create or replace function cleanup_active_users()
returns void
language plpgsql
as $$
begin
  delete from active_users
  where last_seen < now() - interval '2 minutes';
end;
$$;

alter table visits enable row level security;
alter table active_users enable row level security;
alter table orders enable row level security;

drop policy if exists "anon_insert_visits" on visits;
drop policy if exists "anon_select_visits" on visits;
create policy "anon_insert_visits" on visits for insert to anon with check (true);
create policy "anon_select_visits" on visits for select to anon using (true);

drop policy if exists "anon_insert_active_users" on active_users;
drop policy if exists "anon_update_active_users" on active_users;
drop policy if exists "anon_select_active_users" on active_users;
create policy "anon_insert_active_users" on active_users for insert to anon with check (true);
create policy "anon_update_active_users" on active_users for update to anon using (true);
create policy "anon_select_active_users" on active_users for select to anon using (true);

drop policy if exists "anon_insert_orders" on orders;
drop policy if exists "anon_select_orders" on orders;
drop policy if exists "anon_update_orders" on orders;
create policy "anon_insert_orders" on orders for insert to anon with check (true);
create policy "anon_select_orders" on orders for select to anon using (true);
create policy "anon_update_orders" on orders for update to anon using (true);

alter publication supabase_realtime add table active_users;
alter publication supabase_realtime add table visits;
alter publication supabase_realtime add table orders;

-- Bookings table for item reservations / bookings
create table if not exists bookings (
  id            uuid        primary key default uuid_generate_v4(),
  booking_number text       unique not null,
  customer_name  text       not null,
  customer_email text,
  customer_phone text       not null,
  product_id     text       not null,
  product_name   text       not null,
  quantity       integer    not null default 1,
  booking_time   timestamptz not null default now(),
  status         text       not null default 'pending',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint bookings_status_check check (status in ('pending','confirmed','cancelled'))
);

create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_booking_number_idx on bookings (booking_number);

drop trigger if exists set_bookings_updated_at on bookings;
create trigger set_bookings_updated_at
before update on bookings
for each row
execute function set_updated_at();

alter table bookings enable row level security;

drop policy if exists "anon_insert_bookings" on bookings;
drop policy if exists "anon_select_bookings" on bookings;
drop policy if exists "anon_update_bookings" on bookings;
create policy "anon_insert_bookings" on bookings for insert to anon with check (true);
create policy "anon_select_bookings" on bookings for select to anon using (true);
create policy "anon_update_bookings" on bookings for update to anon using (true);

alter publication supabase_realtime add table bookings;

-- Products table for catalogue management
create table if not exists products (
  id          text        primary key,
  name        text        not null,
  brand       text        not null default 'ADEDAS MULTIBUSINESS',
  category    text        not null,
  price       integer     not null,
  promo_price integer,
  volume      text        not null default '',
  image       text        not null default '/placeholder.svg',
  description text        not null default '',
  tags        text[]      not null default '{}',
  in_stock    boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_in_stock_idx  on products (in_stock);

drop trigger if exists set_products_updated_at on products;
create trigger set_products_updated_at
before update on products
for each row
execute function set_updated_at();

alter table products enable row level security;

drop policy if exists "anon_select_products" on products;
drop policy if exists "anon_insert_products" on products;
drop policy if exists "anon_update_products" on products;
drop policy if exists "anon_delete_products" on products;

create policy "anon_select_products" on products for select to anon using (true);
create policy "anon_insert_products" on products for insert to anon with check (true);
create policy "anon_update_products" on products for update to anon using (true);
create policy "anon_delete_products" on products for delete to anon using (true);
