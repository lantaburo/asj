-- Extend enum ProgramCategory with additional operational categories.
ALTER TYPE "ProgramCategory" ADD VALUE IF NOT EXISTS 'INHOUSE';
ALTER TYPE "ProgramCategory" ADD VALUE IF NOT EXISTS 'SERTIFIKASI';
ALTER TYPE "ProgramCategory" ADD VALUE IF NOT EXISTS 'AUDIT';
ALTER TYPE "ProgramCategory" ADD VALUE IF NOT EXISTS 'LAINNYA';

-- Add instructor level enum for internal instructor profiling.
CREATE TYPE "InstructorLevel" AS ENUM ('JUNIOR', 'MADYA', 'SENIOR', 'MASTER');

-- Add optional custom category label on Program for LAINNYA.
ALTER TABLE "Program"
ADD COLUMN "customCategory" TEXT;

-- Add optional instructor level on User.
ALTER TABLE "User"
ADD COLUMN "instructorLevel" "InstructorLevel";

-- Backfill existing instructors to MADYA as sensible default.
UPDATE "User"
SET "instructorLevel" = 'MADYA'
WHERE "role" = 'INSTRUCTOR' AND "instructorLevel" IS NULL;
