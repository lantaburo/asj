-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('PENDING', 'KOMPETEN', 'BELUM_KOMPETEN');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('OPEN', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InstructorLevel" AS ENUM ('JUNIOR', 'MADYA', 'SENIOR', 'MASTER');

-- CreateEnum
CREATE TYPE "ProgramCategory" AS ENUM ('BNSP', 'KEMENAKER', 'INHOUSE', 'SERTIFIKASI', 'AUDIT', 'LAINNYA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'ASSESSOR', 'TRAINEE', 'CLIENT_HR', 'AUDITOR');

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

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gpsCoordinates" JSONB,
    "selfieUrl" TEXT,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "deviceInfo" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "instructorId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "quota" INTEGER NOT NULL,
    "price" INTEGER,
    "status" "BatchStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assessorId" TEXT,
    "classroomId" TEXT,
    "pricePackages" JSONB,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateConfig" (
    "id" TEXT NOT NULL,
    "pdfTemplateUrl" TEXT,
    "signatureUrl" TEXT,
    "passingGrade" INTEGER NOT NULL DEFAULT 70,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programId" TEXT,
    "signatoryName" TEXT,
    "validityMonths" INTEGER,
    "signatoryTitle" TEXT,

    CONSTRAINT "CertificateConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "classroomId" TEXT,
    "instructorId" TEXT,
    "title" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "locationType" TEXT NOT NULL DEFAULT 'Classroom',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessorId" TEXT,
    "jp" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "facilities" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationDocs" JSONB,
    "assessmentStatus" "AssessmentStatus" NOT NULL DEFAULT 'PENDING',
    "certificateNum" TEXT,
    "expiryDate" TIMESTAMP(3),
    "qrVerifyCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K3Log" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "safetyScore" INTEGER,
    "verifiedById" TEXT,
    "evidenceUrl" TEXT,
    "gpsWatermark" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "K3Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ProgramCategory" NOT NULL,
    "industryType" TEXT NOT NULL DEFAULT 'Umum',
    "description" TEXT,
    "curriculum" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customCategory" TEXT,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaUnit" (
    "id" TEXT NOT NULL,
    "unitSchemaId" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 1,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "criteria" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemaUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitSchema" (
    "id" TEXT NOT NULL,
    "programId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TRAINEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passwordHash" TEXT,
    "instructorLevel" "InstructorLevel",
    "participantDocuments" JSONB,
    "licenseNumber" TEXT,
    "profilePictureUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiBrain_purpose_key" ON "AiBrain"("purpose");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_sessionId_userId_key" ON "Attendance"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateConfig_programId_key" ON "CertificateConfig"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_certificateNum_key" ON "Enrollment"("certificateNum");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_qrVerifyCode_key" ON "Enrollment"("qrVerifyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_batchId_userId_key" ON "Enrollment"("batchId", "userId");

-- CreateIndex
CREATE INDEX "SchemaUnit_unitSchemaId_orderIndex_idx" ON "SchemaUnit"("unitSchemaId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SchemaUnit_unitSchemaId_unitCode_key" ON "SchemaUnit"("unitSchemaId", "unitCode");

-- CreateIndex
CREATE UNIQUE INDEX "UnitSchema_code_key" ON "UnitSchema"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateConfig" ADD CONSTRAINT "CertificateConfig_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K3Log" ADD CONSTRAINT "K3Log_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K3Log" ADD CONSTRAINT "K3Log_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaUnit" ADD CONSTRAINT "SchemaUnit_unitSchemaId_fkey" FOREIGN KEY ("unitSchemaId") REFERENCES "UnitSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitSchema" ADD CONSTRAINT "UnitSchema_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

