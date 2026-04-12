-- Add labels (text array) and subtasks (jsonb) to tasks
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "labels" text[] NOT NULL DEFAULT '{}';
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "subtasks" jsonb NOT NULL DEFAULT '[]';

-- Update priority check to include 'urgent'
-- (no constraint was enforced, so just documenting: low | medium | high | urgent)

-- Task comments
CREATE TABLE IF NOT EXISTS "task_comments" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Index for fast comment lookup by task
CREATE INDEX IF NOT EXISTS "task_comments_task_id_idx" ON "task_comments"("task_id");
