-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. MESSAGES (Contact Form)
create table messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  domain text, /* 'design', 'web', 'automation', 'other' */
  content text not null,
  read boolean default false
);

-- 2. PROJECTS (Portfolio)
create table projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  category text not null,
  image_url text,
  status text default 'published', /* 'published', 'draft', 'archived' */
  views integer default 0
);

-- 3. SKILLS (Arsenal)
create table skills (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  category text,
  level integer default 1, /* 1-100 or specific scale */
  icon_name text /* Lucide icon name */
);

-- 4. TESTIMONIALS (Alliances)
create table testimonials (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  role text,
  company text,
  message text not null,
  rating integer default 5,
  avatar_url text,
  approved boolean default false
);

-- RLS POLICIES (Security)
-- Enable RLS
alter table messages enable row level security;
alter table projects enable row level security;
alter table skills enable row level security;
alter table testimonials enable row level security;

-- Public Access (Read)
create policy "Public projects are viewable by everyone." on projects for select using (status = 'published');
create policy "Public skills are viewable by everyone." on skills for select using (true);
create policy "Approved testimonials are viewable by everyone." on testimonials for select using (approved = true);

-- Public Access (Insert - Contact Form)
create policy "Anyone can send a message." on messages for insert with check (true);

-- Admin Access (Full Control) - Assuming you will use Supabase Auth for admin
-- For now, allowing all for development if needed, BUT RECOMMEND SECURING WITH AUTH UID LATER
-- create policy "Admins can do everything" on messages for all using (auth.uid() = 'YOUR_ADMIN_UUID');
