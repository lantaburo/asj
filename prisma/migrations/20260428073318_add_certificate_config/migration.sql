-- CreateTable
CREATE TABLE "CertificateConfig" (
    "id" TEXT NOT NULL DEFAULT 'GLOBAL',
    "pdfTemplateUrl" TEXT,
    "signatureUrl" TEXT,
    "passingGrade" INTEGER NOT NULL DEFAULT 70,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateConfig_pkey" PRIMARY KEY ("id")
);
