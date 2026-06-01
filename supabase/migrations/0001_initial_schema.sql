-- BookZy MVP initial schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  category text,
  city text,
  whatsapp_number text,
  description text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  duration_minutes integer not null,
  price numeric(10, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_duration_positive check (duration_minutes > 0),
  constraint services_price_not_negative check (price is null or price >= 0)
);

create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null,
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_hours_day_valid check (day_of_week between 0 and 6),
  constraint business_hours_time_valid check (
    is_closed = true
    or (open_time is not null and close_time is not null and open_time < close_time)
  ),
  constraint business_hours_one_row_per_day unique (business_id, day_of_week)
);

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  block_date date not null,
  start_time time not null,
  end_time time not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_slots_time_valid check (start_time < end_time)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  whatsapp_number text not null,
  email text,
  no_show_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_no_show_count_valid check (no_show_count >= 0),
  constraint customers_unique_whatsapp_per_business unique (business_id, whatsapp_number)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null references public.services(id),
  customer_id uuid references public.customers(id),
  customer_name text not null,
  customer_whatsapp text not null,
  customer_email text,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'confirmed',
  notes text,
  cancel_token text not null default encode(gen_random_bytes(24), 'hex') unique,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_status_valid check (status in ('confirmed', 'completed', 'cancelled', 'no_show')),
  constraint bookings_time_valid check (start_time < end_time),
  constraint bookings_cancelled_at_valid check (
    (status = 'cancelled' and cancelled_at is not null)
    or (status <> 'cancelled')
  )
);

create table if not exists public.reminders_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reminder_type text not null,
  channel text not null default 'email',
  sent_at timestamptz not null default now(),
  provider_message_id text,
  constraint reminders_log_type_valid check (reminder_type in ('confirmation', '24h', '1h')),
  constraint reminders_log_channel_valid check (channel in ('email', 'whatsapp')),
  constraint reminders_log_no_duplicates unique (booking_id, reminder_type, channel)
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists businesses_slug_idx on public.businesses(slug);
create index if not exists services_business_id_idx on public.services(business_id);
create index if not exists business_hours_business_id_idx on public.business_hours(business_id);
create index if not exists blocked_slots_lookup_idx on public.blocked_slots(business_id, block_date);
create index if not exists customers_business_id_idx on public.customers(business_id);
create index if not exists bookings_business_date_idx on public.bookings(business_id, appointment_date);
create index if not exists bookings_service_date_idx on public.bookings(service_id, appointment_date);
create index if not exists bookings_cancel_token_idx on public.bookings(cancel_token);
create index if not exists reminders_log_booking_id_idx on public.reminders_log(booking_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists business_hours_set_updated_at on public.business_hours;
create trigger business_hours_set_updated_at
before update on public.business_hours
for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.reminders_log enable row level security;

drop policy if exists "Owners can read own businesses" on public.businesses;
create policy "Owners can read own businesses"
on public.businesses for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Owners can create own businesses" on public.businesses;
create policy "Owners can create own businesses"
on public.businesses for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Owners can update own businesses" on public.businesses;
create policy "Owners can update own businesses"
on public.businesses for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Public can read active businesses" on public.businesses;
create policy "Public can read active businesses"
on public.businesses for select
to anon
using (is_active = true);

drop policy if exists "Owners can manage own services" on public.services;
create policy "Owners can manage own services"
on public.services for all
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = services.business_id
    and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = services.business_id
    and businesses.owner_id = auth.uid()
  )
);

drop policy if exists "Public can read active services for active businesses" on public.services;
create policy "Public can read active services for active businesses"
on public.services for select
to anon
using (
  is_active = true
  and exists (
    select 1 from public.businesses
    where businesses.id = services.business_id
    and businesses.is_active = true
  )
);

drop policy if exists "Owners can manage own business hours" on public.business_hours;
create policy "Owners can manage own business hours"
on public.business_hours for all
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = business_hours.business_id
    and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = business_hours.business_id
    and businesses.owner_id = auth.uid()
  )
);

drop policy if exists "Public can read hours for active businesses" on public.business_hours;
create policy "Public can read hours for active businesses"
on public.business_hours for select
to anon
using (
  exists (
    select 1 from public.businesses
    where businesses.id = business_hours.business_id
    and businesses.is_active = true
  )
);

drop policy if exists "Owners can manage own blocked slots" on public.blocked_slots;
create policy "Owners can manage own blocked slots"
on public.blocked_slots for all
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = blocked_slots.business_id
    and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = blocked_slots.business_id
    and businesses.owner_id = auth.uid()
  )
);

drop policy if exists "Public can read blocked slots for active businesses" on public.blocked_slots;
create policy "Public can read blocked slots for active businesses"
on public.blocked_slots for select
to anon
using (
  exists (
    select 1 from public.businesses
    where businesses.id = blocked_slots.business_id
    and businesses.is_active = true
  )
);

drop policy if exists "Owners can manage own customers" on public.customers;
create policy "Owners can manage own customers"
on public.customers for all
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = customers.business_id
    and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = customers.business_id
    and businesses.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can manage own bookings" on public.bookings;
create policy "Owners can manage own bookings"
on public.bookings for all
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = bookings.business_id
    and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = bookings.business_id
    and businesses.owner_id = auth.uid()
  )
);

drop policy if exists "Public can create bookings for active businesses" on public.bookings;
create policy "Public can create bookings for active businesses"
on public.bookings for insert
to anon
with check (
  status = 'confirmed'
  and exists (
    select 1 from public.businesses
    where businesses.id = bookings.business_id
    and businesses.is_active = true
  )
  and exists (
    select 1 from public.services
    where services.id = bookings.service_id
    and services.business_id = bookings.business_id
    and services.is_active = true
  )
);

-- Public cancellation must go through a Next.js API route using the service role key,
-- where the cancel_token can be verified server-side. Do not allow anon direct updates.

drop policy if exists "Owners can read own reminder logs" on public.reminders_log;
create policy "Owners can read own reminder logs"
on public.reminders_log for select
to authenticated
using (
  exists (
    select 1
    from public.bookings
    join public.businesses on businesses.id = bookings.business_id
    where bookings.id = reminders_log.booking_id
    and businesses.owner_id = auth.uid()
  )
);
