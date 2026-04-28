-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_assessorId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_programId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_batchId_fkey";

-- DropForeignKey
ALTER TABLE "K3Log" DROP CONSTRAINT "K3Log_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "UnitSchema" DROP CONSTRAINT "UnitSchema_programId_fkey";

-- AlterTable
ALTER TABLE "CertificateConfig" ADD COLUMN     "programId" TEXT,
ADD COLUMN     "signatoryName" TEXT,
ADD COLUMN     "signatoryTitle" TEXT,
ADD COLUMN     "validityMonths" INTEGER,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN     "assessorId" TEXT,
ADD COLUMN     "jp" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "AiBrain" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiBrain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
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
CREATE UNIQUE INDEX "AiBrain_purpose_key" ON "AiBrain"("purpose");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateConfig_programId_key" ON "CertificateConfig"("programId");

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

