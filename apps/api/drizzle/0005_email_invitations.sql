-- 0005_email_invitations.sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp;
