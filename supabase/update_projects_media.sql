-- 1. Alter PROJECTS table to support richer media
-- Adding gallery support (multiple images for graphic design)
alter table projects add column if not exists images text[]; 

-- Adding video support (direct file upload vs external link)
alter table projects add column if not exists video_url text; -- For direct uploads
-- (We already have 'link' column for external YouTube/Vimeo/Behance links)

-- Adding file support (for automation workflows, PDF downloads, etc.)
alter table projects add column if not exists file_url text; 

-- Adding specific "type" if we need more granularity than category, though category is good.
-- For now, category is sufficient: 'WEB DESIGN', 'DESIGN GRAPHIQUE', 'AUTOMATISATION', 'COMMUNITY MANAGEMENT', 'COPYWRITING', 'MONTAGE VIDÉO'

-- 2. Create Storage Buckets if they don't exist (this is usually done in UI but can be scripted via policies)
-- We'll assume 'projects' bucket exists or we use 'logos' temporarily. Let's try to set up a 'portfolio-assets' bucket properly if we can via SQL (limited support, better to just use existing or documented bucket).
-- For now, we will continue using the 'logos' bucket or a new 'portfolio' folder within it, but ideally we'd want a dedicated bucket.
-- I'll stick to updating the table schema here.

-- 3. Update RLS policies to ensure these new columns are accessible
-- The existing policies are "select using (status = 'published')" which covers all columns, so no change needed there.

-- 4. Enable efficient querying
create index if not exists projects_category_idx on projects (category);
create index if not exists projects_status_idx on projects (status);
