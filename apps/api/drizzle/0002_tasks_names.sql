-- Add first_name and last_name to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" text;

-- Create tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'todo',
  "priority" text NOT NULL DEFAULT 'medium',
  "deadline" timestamp,
  "points" integer NOT NULL DEFAULT 0,
  "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_by" uuid NOT NULL REFERENCES "users"("id"),
  "project_id" uuid REFERENCES "projects"("id") ON DELETE SET NULL,
  "completed_at" timestamp,
  "points_awarded" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
