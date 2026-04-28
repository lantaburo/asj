import { PrismaClient, ProgramCategory, BatchStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting dummy data seeding...");

  // 1. Ensure Demo Users
  const instructor = await prisma.user.upsert({
    where: { email: "instruktur@ajs.local" },
    update: {},
    create: {
      email: "instruktur@ajs.local",
      fullName: "Instruktur Demo AJS",
      role: Role.INSTRUCTOR,
    }
  });

  const assessor = await prisma.user.upsert({
    where: { email: "assessor@ajs.local" },
    update: {},
    create: {
      email: "assessor@ajs.local",
      fullName: "Assessor Demo AJS",
      role: Role.ASSESSOR,
    }
  });

  const classroom = await prisma.classroom.findFirst();
  const classroomId = classroom?.id;

  const programs = [
    { title: "Ahli K3 Konstruksi Madya", category: ProgramCategory.BNSP, industry: "Konstruksi" },
    { title: "Petugas Peran Kebakaran Kelas D", category: ProgramCategory.KEMENAKER, industry: "Manufaktur" },
    { title: "Sertifikasi Auditor SMK3 Internal", category: ProgramCategory.AUDIT, industry: "Umum" },
  ];

  for (const pData of programs) {
    const program = await prisma.program.create({
      data: {
        title: pData.title,
        category: pData.category,
        industryType: pData.industry,
        description: `Program pelatihan intensif untuk sertifikasi ${pData.title} dengan kurikulum terbaru.`,
        isActive: true,
      }
    });
    console.log(`✅ Created Program: ${program.title}`);

    for (let i = 1; i <= 3; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (i * 30));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const batch = await prisma.batch.create({
        data: {
          programId: program.id,
          instructorId: instructor.id,
          assessorId: assessor.id,
          startDate,
          endDate,
          quota: 20,
          price: 3500000 + (i * 500000),
          status: BatchStatus.OPEN,
          classroomId: classroomId ?? null,
        }
      });
      console.log(`   📦 Created Batch ${i} for ${program.title}`);

      for (let j = 1; j <= 5; j++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(sessionDate.getDate() + (j - 1));
        
        const startTime = new Date(sessionDate);
        startTime.setHours(8, 0, 0, 0);
        const endTime = new Date(sessionDate);
        endTime.setHours(12, 0, 0, 0);

        await prisma.classSession.create({
          data: {
            batchId: batch.id,
            instructorId: instructor.id,
            classroomId: classroomId ?? null,
            title: `Sesi ${j}: Pembahasan Materi ${j}`,
            sessionDate,
            startTime,
            endTime,
            locationType: "Classroom"
          }
        });
      }
      console.log(`      🕒 Created 5 Sessions for Batch ${i}`);
    }
  }

  console.log("🏁 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
