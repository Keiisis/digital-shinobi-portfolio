-- 1. Create SKILLS table if it doesn't exist
create table if not exists skills (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  category text,
  level integer default 1,
  icon_name text,
  color text default 'text-[#E50914]',
  image_url text
);

-- 2. Clear existing entries to prevent duplicates
delete from skills;

-- 3. Insert Seed Data with SWAPPED Icons
insert into skills (name, category, level, icon_name, color) values
('DESIGN GRAPHIQUE', 'DESIGN', 90, 'PenTool', 'text-[#E50914]'),  -- Swapped Icon
('WEB DESIGN', 'WEB', 85, 'Monitor', 'text-[#E50914]'),
('AUTOMATISATION', 'DEV', 95, 'Cpu', 'text-[#00FFFF]'),
('COMMUNITY MANAGEMENT', 'MARKETING', 80, 'Users', 'text-[#E50914]'),
('COPYWRITING', 'MARKETING', 75, 'FileText', 'text-[#E50914]'),   -- Swapped Icon
('MONTAGE VIDÉO', 'DESIGN', 70, 'Video', 'text-[#E50914]');

-- 4. Enable RLS
alter table skills enable row level security;
create policy "Public skills are viewable by everyone." on skills for select using (true);
create policy "Admins can insert skills" on skills for insert with check (true);
create policy "Admins can update skills" on skills for update using (true);
create policy "Admins can delete skills" on skills for delete using (true);
