-- Create a table for global site settings
create table site_settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table site_settings enable row level security;

-- Public have read access
create policy "Public can view site settings."
  on site_settings for select
  using ( true );

-- Only authenticated users (Admins) can update/insert
create policy "Admins can update site settings."
  on site_settings for all
  using ( auth.role() = 'authenticated' );

-- Insert default values (SEED)
insert into site_settings (key, value) values
('logo_text', 'DIGITAL SHINOBI'),
('hero_title', 'KEVIN CHACHA'),
('hero_subtitle', 'Architecte du Digital'),
('contact_email', 'chefkeiis377@gmail.com');
