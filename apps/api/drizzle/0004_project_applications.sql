-- 0004_project_applications.sql
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "registration_enabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "application_fee" integer NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "auto_approve" boolean NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "form_fields" jsonb NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "stripe_product_id" text;

CREATE TABLE IF NOT EXISTS "project_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "email" text NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "phone" text,
  "form_data" jsonb NOT NULL DEFAULT '{}',
  "payment_status" text NOT NULL DEFAULT 'free',
  "stripe_session_id" text,
  "stripe_payment_intent_id" text,
  "status" text NOT NULL DEFAULT 'pending',
  "temp_password" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);
