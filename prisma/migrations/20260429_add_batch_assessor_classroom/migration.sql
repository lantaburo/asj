-- Add missing columns to Batch table
ALTER TABLE "Batch" ADD COLUMN IF NOT EXISTS "assessorId" TEXT REFERENCES "User"(id);
ALTER TABLE "Batch" ADD COLUMN IF NOT EXISTS "classroomId" TEXT REFERENCES "Classroom"(id);
ALTER TABLE "Batch" ADD COLUMN IF NOT EXISTS "pricePackages" JSONB;
