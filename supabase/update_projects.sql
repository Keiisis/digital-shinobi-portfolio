-- Add DESCRIPTION column to projects table
alter table projects add column if not exists description text;
alter table projects add column if not exists link text;
-- Ensure ID is UUID
alter table projects alter column id set default uuid_generate_v4();
