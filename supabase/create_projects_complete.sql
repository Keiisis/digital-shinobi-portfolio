-- 1. Create PROJECTS table if it doesn't exist
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  category text not null,
  image_url text,
  status text default 'published', -- 'published', 'draft', 'archived'
  views integer default 0,
  description text,
  link text
);

-- 2. Enable RLS
alter table projects enable row level security;

-- 3. Public Access (Read Only for Published)
create policy "Public projects are viewable by everyone." on projects for select using (status = 'published');

-- 4. Admin Access (Full Control)
-- Allowing all for authenticated users (admins) or development convenience
create policy "Admins can insert projects" on projects for insert with check (true);
create policy "Admins can update projects" on projects for update using (true);
create policy "Admins can delete projects" on projects for delete using (true);
