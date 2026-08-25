import {
  BatchStatus,
  InstructorLevel,
  ProgramCategory,
  PrismaClient,
  Role
} from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const superAdminId = "00000000-0000-0000-0000-000000000010";
  const instructorId = "00000000-0000-0000-0000-000000000011";
  const traineeId = "00000000-0000-0000-0000-000000000012";
  const assessorId = "00000000-0000-0000-0000-000000000013";
  const mujahidaId = "00000000-0000-0000-0000-000000000014";
  const programId = "00000000-0000-0000-0000-000000000021";
  const batchId = "00000000-0000-0000-0000-000000000031";
  const classroomId = "00000000-0000-0000-0000-000000000041";
  const sessionId = "00000000-0000-0000-0000-000000000051";
  const superAdminEmail =
    process.env.AJS_SUPERADMIN_EMAIL?.trim().toLowerCase() || "superadmin@ajs.local";
  const superAdminName = process.env.AJS_SUPERADMIN_NAME?.trim() || "Super Admin AJS";
  const superAdminPassword =
    process.env.AJS_SUPERADMIN_PASSWORD || "Superadmin123!";
  const superAdminPasswordHash = hashPassword(superAdminPassword);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      fullName: superAdminName,
      role: Role.SUPER_ADMIN,
      passwordHash: superAdminPasswordHash
    },
    create: {
      id: superAdminId,
      email: superAdminEmail,
      fullName: superAdminName,
      role: Role.SUPER_ADMIN,
      passwordHash: superAdminPasswordHash
    }
  });

  const mujahidaEmail = "mujahida@ajs.local";
  const mujahidaPasswordHash = hashPassword("Ajs@Mujahida2024");
  await prisma.user.upsert({
    where: { email: mujahidaEmail },
    update: {
      fullName: "Mujahida",
      role: Role.ADMIN,
      passwordHash: mujahidaPasswordHash
    },
    create: {
      id: mujahidaId,
      email: mujahidaEmail,
      fullName: "Mujahida",
      role: Role.ADMIN,
      passwordHash: mujahidaPasswordHash
    }
  });

  await prisma.user.upsert({
    where: { email: "instruktur@ajs.local" },
    update: {
      fullName: "Instruktur AJS",
      role: Role.INSTRUCTOR,
      instructorLevel: InstructorLevel.MADYA,
      passwordHash: null
    },
    create: {
      id: instructorId,
      email: "instruktur@ajs.local",
      fullName: "Instruktur AJS",
      role: Role.INSTRUCTOR,
      instructorLevel: InstructorLevel.MADYA,
      passwordHash: null
    }
  });

  await prisma.user.upsert({
    where: { email: "peserta@ajs.local" },
    update: {
      fullName: "Peserta Demo",
      passwordHash: null
    },
    create: {
      id: traineeId,
      email: "peserta@ajs.local",
      fullName: "Peserta Demo",
      role: Role.TRAINEE,
      passwordHash: null
    }
  });

  await prisma.user.upsert({
    where: { email: "assessor@ajs.local" },
    update: {
      fullName: "Assessor AJS",
      role: Role.ASSESSOR,
      passwordHash: null
    },
    create: {
      id: assessorId,
      email: "assessor@ajs.local",
      fullName: "Assessor AJS",
      role: Role.ASSESSOR,
      passwordHash: null
    }
  });

  await prisma.program.upsert({
    where: { id: programId },
    update: {
      title: "Ahli K3 Umum",
      category: ProgramCategory.KEMENAKER,
      description: "Program pelatihan inti AJS untuk sertifikasi Ahli K3 Umum.",
      industryType: "Umum",
      isActive: true
    },
    create: {
      id: programId,
      title: "Ahli K3 Umum",
      category: ProgramCategory.KEMENAKER,
      description: "Program pelatihan inti AJS untuk sertifikasi Ahli K3 Umum.",
      industryType: "Umum",
      curriculum: {
        modules: ["Regulasi K3", "Audit Dasar", "Manajemen Risiko"]
      },
      isActive: true
    }
  });

  const unitSchema = await prisma.unitSchema.upsert({
    where: {
      code: "AJS-AKU-2026"
    },
    update: {
      programId,
      title: "Skema Ahli K3 Umum",
      level: "Level 6",
      description: "Rangkaian unit kompetensi inti untuk sertifikasi Ahli K3 Umum.",
      isActive: true
    },
    create: {
      code: "AJS-AKU-2026",
      programId,
      title: "Skema Ahli K3 Umum",
      level: "Level 6",
      description: "Rangkaian unit kompetensi inti untuk sertifikasi Ahli K3 Umum.",
      isActive: true
    }
  });

  const schemaUnits = [
    {
      unitCode: "K3-AKU-001",
      title: "Menerapkan Regulasi Dasar K3",
      orderIndex: 1,
      isMandatory: true
    },
    {
      unitCode: "K3-AKU-002",
      title: "Melakukan Identifikasi Bahaya dan Penilaian Risiko",
      orderIndex: 2,
      isMandatory: true
    },
    {
      unitCode: "K3-AKU-003",
      title: "Menyusun Program Pengendalian Risiko K3",
      orderIndex: 3,
      isMandatory: true
    }
  ] as const;

  for (const unit of schemaUnits) {
    await prisma.schemaUnit.upsert({
      where: {
        unitSchemaId_unitCode: {
          unitSchemaId: unitSchema.id,
          unitCode: unit.unitCode
        }
      },
      update: {
        title: unit.title,
        orderIndex: unit.orderIndex,
        isMandatory: unit.isMandatory
      },
      create: {
        unitSchemaId: unitSchema.id,
        unitCode: unit.unitCode,
        title: unit.title,
        orderIndex: unit.orderIndex,
        isMandatory: unit.isMandatory
      }
    });
  }

  await prisma.classroom.upsert({
    where: { id: classroomId },
    update: {
      roomName: "Ruang Kelas AJS 1",
      capacity: 30
    },
    create: {
      id: classroomId,
      roomName: "Ruang Kelas AJS 1",
      capacity: 30,
      facilities: {
        wifi: true,
        projector: true
      }
    }
  });

  await prisma.batch.upsert({
    where: { id: batchId },
    update: {
      programId,
      instructorId,
      quota: 25,
      price: 4500000,
      status: BatchStatus.OPEN,
      startDate: new Date("2026-05-20T08:00:00.000Z"),
      endDate: new Date("2026-05-28T16:00:00.000Z")
    },
    create: {
      id: batchId,
      programId,
      instructorId,
      quota: 25,
      price: 4500000,
      status: BatchStatus.OPEN,
      startDate: new Date("2026-05-20T08:00:00.000Z"),
      endDate: new Date("2026-05-28T16:00:00.000Z")
    }
  });

  await prisma.classSession.upsert({
    where: { id: sessionId },
    update: {
      batchId,
      classroomId,
      instructorId,
      title: "Pembukaan dan Pengantar K3 Umum",
      sessionDate: new Date("2026-05-20T08:00:00.000Z"),
      startTime: new Date("2026-05-20T08:00:00.000Z"),
      endTime: new Date("2026-05-20T10:00:00.000Z"),
      locationType: "Classroom"
    },
    create: {
      id: sessionId,
      batchId,
      classroomId,
      instructorId,
      title: "Pembukaan dan Pengantar K3 Umum",
      sessionDate: new Date("2026-05-20T08:00:00.000Z"),
      startTime: new Date("2026-05-20T08:00:00.000Z"),
      endTime: new Date("2026-05-20T10:00:00.000Z"),
      locationType: "Classroom"
    }
  });

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      batchId,
      userId: traineeId
    }
  });

  const enrollment =
    existingEnrollment ??
    (await prisma.enrollment.create({
      data: {
        batchId,
        userId: traineeId,
        registrationDocs: {
          ktp: "https://storage.ajs.local/demo/ktp.pdf",
          cv: "https://storage.ajs.local/demo/cv.pdf"
        }
      }
    }));

  const existingLog = await prisma.k3Log.findFirst({
    where: {
      enrollmentId: enrollment.id,
      activityName: "Inspeksi APAR Dasar"
    }
  });

  if (!existingLog) {
    await prisma.k3Log.create({
      data: {
        enrollmentId: enrollment.id,
        activityName: "Inspeksi APAR Dasar",
        safetyScore: 88,
        verifiedById: assessorId,
        evidenceUrl: "https://storage.ajs.local/demo/log-apar.jpg",
        gpsWatermark: {
          lat: -7.7956,
          lng: 110.3695
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
