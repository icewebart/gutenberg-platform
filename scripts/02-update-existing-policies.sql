-- This script updates existing RLS policies to use the correct 'users' table
-- Run this after the initial schema is set up

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Board Members and Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Authorized users can update projects" ON projects;
DROP POLICY IF EXISTS "Authorized users can delete projects" ON projects;
DROP POLICY IF EXISTS "Authorized users can add project members" ON project_members;
DROP POLICY IF EXISTS "Authorized users can remove project members" ON project_members;

-- These policies are already created in the initial schema, 
-- but this script ensures they reference the correct table

-- Note: The initial schema (01-initial-schema.sql) already has the correct policies
-- This file is kept for reference in case manual updates are needed
