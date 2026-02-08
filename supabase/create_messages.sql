-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  domain text,
  content text not null,
  read boolean default false
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies
create policy "Anyone can insert messages"
  on public.messages for insert
  with check (true);

create policy "Authenticated users can view messages"
  on public.messages for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update messages"
  on public.messages for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete messages"
  on public.messages for delete
  using (auth.role() = 'authenticated');
