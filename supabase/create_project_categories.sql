-- Create project categories table for dynamic category management
CREATE TABLE IF NOT EXISTS project_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    supports_multiple_images BOOLEAN DEFAULT true,
    supports_videos BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all categories with proper configuration
INSERT INTO project_categories (name, slug, supports_multiple_images, supports_videos, display_order, is_active) VALUES
('DESIGN GRAPHIQUE', 'design-graphique', true, false, 1, true),
('WEB DESIGN', 'web-design', true, false, 2, true),
('UI/UX', 'ui-ux', true, true, 3, true),
('AUTOMATISATION', 'automatisation', true, false, 4, true),
('COMMUNITY MANAGEMENT', 'community-management', true, false, 5, true),
('COPYWRITING', 'copywriting', true, false, 6, true),
('MONTAGE VIDÉO', 'montage-video', true, true, 7, true),
('ILLUSTRATION', 'illustration', true, false, 8, true),
('MOTION', 'motion', true, true, 9, true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    supports_multiple_images = EXCLUDED.supports_multiple_images,
    supports_videos = EXCLUDED.supports_videos,
    display_order = EXCLUDED.display_order;

-- Create videos column in projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'videos'
    ) THEN
        ALTER TABLE projects ADD COLUMN videos TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to categories"
ON project_categories FOR SELECT
TO PUBLIC
USING (is_active = true);

-- Allow authenticated users to manage categories
CREATE POLICY "Allow authenticated users full access to categories"
ON project_categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMENT ON TABLE project_categories IS 'Dynamic project categories with media support configuration';
COMMENT ON COLUMN project_categories.supports_multiple_images IS 'If true, category allows multiple image uploads';
COMMENT ON COLUMN project_categories.supports_videos IS 'If true, category allows video URLs (YouTube, Vimeo, etc.)';
