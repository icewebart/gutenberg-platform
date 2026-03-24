-- 0003_projects_enhanced.sql
-- Add new fields to projects table

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "category" text NOT NULL DEFAULT 'education';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "scale" text NOT NULL DEFAULT 'local';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "funding" text NOT NULL DEFAULT 'self_funded';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "goals" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "kpis" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "partner_organizations" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "budget" integer;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'EUR';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "registration_link" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "expected_participants" integer;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "visibility" text NOT NULL DEFAULT 'internal';
