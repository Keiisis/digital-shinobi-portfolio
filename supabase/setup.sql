-- #########################################################
-- SHINOBI PORTFOLIO TEMPLATE - FULL DATABASE SETUP
-- #########################################################

-- 1. MESSAGES TABLE (Contact Form & AI Replies)
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null,
    domain text,
    content text not null,
    read boolean default false,
    reply_sent boolean default false,
    reply_content text
);

-- 2. PROSPECTS TABLE (CRM & AI Scraper)
create table if not exists public.prospects (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text,
    phone text,
    region text,
    domain text,
    source text,
    notes text
);

-- 3. JOBS TABLE (Job Hunter Scraper)
create table if not exists public.jobs (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    company text,
    location text,
    link text,
    category text,
    region text,
    description text
);

-- 4. TESTIMONIALS TABLE (Client Social Proof)
create table if not exists public.testimonials (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    role text,
    company text,
    content text not null,
    rating integer default 5,
    avatar_url text,
    project_name text,
    approved boolean default false
);

-- 5. ASSISTANT SETTINGS (AI Personality)
create table if not exists public.assistant_settings (
    id uuid default gen_random_uuid() primary key,
    name text default 'Shinobi Assistant',
    personality text default 'Professionnel, mystérieux et ultra-efficace.'
);

-- INITIAL DATA
insert into public.assistant_settings (name, personality)
values ('Shinobi Assistant', 'Expert Stratège et Cloud Shinobi. Ton de voix : professionnel, persuasif, utilisant la PNL.')
on conflict do nothing;

-- SECURITY (Disable RLS for easier admin managed setup, or enable with policies)
alter table public.messages disable row level security;
alter table public.prospects disable row level security;
alter table public.jobs disable row level security;
alter table public.testimonials disable row level security;
alter table public.assistant_settings disable row level security;

-- SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';
