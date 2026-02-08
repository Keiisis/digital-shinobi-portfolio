-- FIX SCRIPT: Run this to ensure all tables exist and are up to date.

-- 1. Create TESTIMONIALS table if it doesn't exist
create table if not exists testimonials (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  role text,
  company text,
  content text not null,
  rating integer default 5,
  avatar_url text
);

-- 2. Add new columns to TESTIMONIALS (idempotent)
alter table testimonials add column if not exists approved boolean default false;
alter table testimonials add column if not exists image_url text; -- in case we want a specific image field distinct from avatar_url
alter table testimonials add column if not exists project_name text;

-- 3. Create CLIENTS table
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  logo_url text,
  website text
);

-- 4. Enable RLS
alter table testimonials enable row level security;
alter table clients enable row level security;

-- 5. Update RLS Policies (Drop first to avoid errors if they exist)
-- Testimonials
drop policy if exists "Public can view testimonials" on testimonials;
drop policy if exists "Public can view APPROVED testimonials" on testimonials;
drop policy if exists "Public can insert testimonials" on testimonials;
drop policy if exists "Admins can view all testimonials" on testimonials;
drop policy if exists "Admins can update testimonials" on testimonials;
drop policy if exists "Admins can delete testimonials" on testimonials;

create policy "Public can view APPROVED testimonials"
  on testimonials for select
  using ( approved = true );

create policy "Public can insert testimonials"
  on testimonials for insert
  with check ( true );

create policy "Admins can view all testimonials"
  on testimonials for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can update testimonials"
  on testimonials for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete testimonials"
  on testimonials for delete
  using ( auth.role() = 'authenticated' );

-- Clients
drop policy if exists "Public can view clients" on clients;
drop policy if exists "Admins can manage clients" on clients;

create policy "Public can view clients"
  on clients for select
  using ( true );

create policy "Admins can manage clients"
  on clients for all
  using ( auth.role() = 'authenticated' );
