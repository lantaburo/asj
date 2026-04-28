import { prisma } from "@/lib/prisma";

export async function getGlobalCertificateConfig() {
  let config = await prisma.certificateConfig.findUnique({
    where: { id: "GLOBAL" },
  });

  if (!config) {
    config = await prisma.certificateConfig.create({
      data: { id: "GLOBAL" },
    });
  }

  return config;
}

export async function getCertificateConfigByProgram(programId?: string | null) {
  if (!programId) {
    return getGlobalCertificateConfig();
  }
  
  let config = await prisma.certificateConfig.findUnique({
    where: { programId },
  });

  if (!config) {
    // Return global fallback but do not create program specific yet until explicitly updated
    return getGlobalCertificateConfig();
  }

  return config;
}

export async function updateCertificateConfig(
  programId: string | null | undefined,
  data: {
    pdfTemplateUrl?: string | null;
    signatureUrl?: string | null;
    signatoryName?: string | null;
    signatoryTitle?: string | null;
    passingGrade?: number;
    validityMonths?: number | null;
  }
) {
  if (!programId || programId === "GLOBAL") {
    return prisma.certificateConfig.upsert({
      where: { id: "GLOBAL" },
      update: data,
      create: {
        id: "GLOBAL",
        ...data,
      },
    });
  }

  return prisma.certificateConfig.upsert({
    where: { programId },
    update: data,
    create: {
      programId,
      ...data,
    },
  });
}
