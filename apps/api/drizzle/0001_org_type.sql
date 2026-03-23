ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'student_organization';
