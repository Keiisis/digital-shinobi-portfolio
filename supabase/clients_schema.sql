-- CLIENTS / PARTNERS TABLE
create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  logo_url text, -- URL to the logo image in storage
  website text
);

-- Enable RLS for clients
alter table clients enable row level security;

create policy "Public can view clients."
  on clients for select
  using ( true );

create policy "Admins can manage clients."
  on clients for all
  using ( auth.role() = 'authenticated' );


-- UPDATE TESTIMONIALS TABLE
-- Add approval workflow and extra fields if they don't exist
alter table testimonials 
add column if not exists approved boolean default false,
add column if not exists image_url text,
add column if not exists project_name text;

-- Update RLS for Testimonials
-- Allow public to INSERT (submit) testimonials, but not update/delete
create policy "Public can insert testimonials."
  on testimonials for insert
  with check ( true );

-- Ensure unapproved testimonials are NOT visible to public (if we had a public select policy)
-- We need to update the existing select policy or create a new one.
-- Assuming "Public can view testimonials" exists:
drop policy if exists "Public can view testimonials" on testimonials;

create policy "Public can view APPROVED testimonials."
  on testimonials for select
  using ( approved = true );

-- Admins can see ALL (including unapproved)
create policy "Admins can view all testimonials."
  on testimonials for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can update testimonials."
  on testimonials for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete testimonials."
  on testimonials for delete
  using ( auth.role() = 'authenticated' );
