-- Enable the storage extension if not already enabled
-- create extension if not exists "storage" schema "extensions"; 
-- (Usually managed by Supabase platform, skipping explicit extension creation to avoid permissions issues)

-- Create a storage bucket called 'uploads' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Set up security policies for the 'uploads' bucket

-- 1. Allow public read access to everyone
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

-- 2. Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads' 
    and auth.role() = 'authenticated'
  );

-- 3. Allow authenticated users to update their own files (or all files for admin simplicity here)
create policy "Authenticated users can update"
  on storage.objects for update
  using (
    bucket_id = 'uploads' 
    and auth.role() = 'authenticated'
  );

-- 4. Allow authenticated users to delete files
create policy "Authenticated users can delete"
  on storage.objects for delete
  using (
    bucket_id = 'uploads' 
    and auth.role() = 'authenticated'
  );
