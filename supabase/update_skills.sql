-- 1. Add new columns to SKILLS table
alter table skills add column if not exists color text default 'text-[#E50914]';
alter table skills add column if not exists image_url text;

-- 2. Clear existing entries to prevent duplicates during seed
delete from skills;

-- 3. Insert Seed Data with SWAPPED Icons for Design/Copywriting
insert into skills (name, category, level, icon_name, color) values
('DESIGN GRAPHIQUE', 'DESIGN', 90, 'PenTool', 'text-[#E50914]'),  -- Swapped Icon (was FileText)
('WEB DESIGN', 'WEB', 85, 'Monitor', 'text-[#E50914]'),
('AUTOMATISATION', 'DEV', 95, 'Cpu', 'text-[#00FFFF]'),
('COMMUNITY MANAGEMENT', 'MARKETING', 80, 'Users', 'text-[#E50914]'),
('COPYWRITING', 'MARKETING', 75, 'FileText', 'text-[#E50914]'),   -- Swapped Icon (was PenTool)
('MONTAGE VIDÉO', 'DESIGN', 70, 'Video', 'text-[#E50914]');

-- 4. Enable RLS (idempotent, just to be safe)
alter table skills enable row level security;
create policy "Public skills are viewable by everyone." on skills for select using (true);
