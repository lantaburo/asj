-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT IF EXISTS "Batch_assessorId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT IF EXISTS "Batch_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT IF EXISTS "Batch_programId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT IF EXISTS "ClassSession_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_batchId_fkey";

-- DropForeignKey
ALTER TABLE "K3Log" DROP CONSTRAINT IF EXISTS "K3Log_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "UnitSchema" DROP CONSTRAINT IF EXISTS "UnitSchema_programId_fkey";

-- AlterTable
ALTER TABLE "CertificateConfig" ADD COLUMN IF NOT EXISTS "programId" TEXT,
ADD COLUMN IF NOT EXISTS "signatoryName" TEXT,
ADD COLUMN IF NOT EXISTS "signatoryTitle" TEXT,
ADD COLUMN IF NOT EXISTS "validityMonths" INTEGER,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN IF NOT EXISTS "assessorId" TEXT,
ADD COLUMN IF NOT EXISTS "jp" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AiBrain" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiBrain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AiBrain_purpose_key" ON "AiBrain"("purpose");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CertificateConfig_programId_key" ON "CertificateConfig"("programId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateConfig" ADD CONSTRAINT "CertificateConfig_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K3Log" ADD CONSTRAINT "K3Log_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitSchema" ADD CONSTRAINT "UnitSchema_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

