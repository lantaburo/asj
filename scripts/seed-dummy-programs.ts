/**
 * Seed script: 3 Real Programs, each with 2 Batches, each Batch with 5 Sessions
 * Run: npx tsx scripts/seed-dummy-programs.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const programs = [
  {
    title: "K3 Umum (Keselamatan dan Kesehatan Kerja Umum)",
    category: "KEMENAKER" as const,
    industryType: "Umum",
    description:
      "Program sertifikasi K3 Umum bagi tenaga kerja di berbagai sektor industri. Peserta akan dibekali pengetahuan tentang regulasi, identifikasi bahaya, manajemen risiko, dan penerapan sistem K3 di tempat kerja.",
    sessions: [
      "Pengenalan K3 dan Peraturan Perundangan",
      "Identifikasi Bahaya dan Penilaian Risiko",
      "Sistem Manajemen K3 (SMK3)",
      "Alat Pelindung Diri (APD) dan Ergonomi",
      "Investigasi Kecelakaan dan Pelaporan",
    ],
    batches: [
      {
        startDate: new Date("2025-06-02"),
        endDate: new Date("2025-06-06"),
        quota: 25,
        price: 2500000,
        status: "OPEN" as const,
      },
      {
        startDate: new Date("2025-07-07"),
        endDate: new Date("2025-07-11"),
        quota: 20,
        price: 2500000,
        status: "OPEN" as const,
      },
    ],
  },
  {
    title: "Ahli K3 Pertambangan (Mining Safety Specialist)",
    category: "BNSP" as const,
    industryType: "Pertambangan",
    description:
      "Program khusus sertifikasi ahli K3 untuk sektor pertambangan. Membahas regulasi pertambangan, pengelolaan bahan peledak, keselamatan alat berat, dan pencegahan penyakit akibat kerja di lingkungan tambang.",
    sessions: [
      "Regulasi K3 Pertambangan dan Lingkungan Hidup",
      "Keselamatan Penggunaan Alat Berat dan Kendaraan Tambang",
      "Pengelolaan Bahan Berbahaya dan Beracun (B3)",
      "Ventilasi Tambang dan Pencegahan Debu Silika",
      "Emergency Response dan Evakuasi Tambang",
    ],
    batches: [
      {
        startDate: new Date("2025-06-09"),
        endDate: new Date("2025-06-13"),
        quota: 20,
        price: 4500000,
        status: "OPEN" as const,
      },
      {
        startDate: new Date("2025-08-04"),
        endDate: new Date("2025-08-08"),
        quota: 20,
        price: 4500000,
        status: "OPEN" as const,
      },
    ],
  },
  {
    title: "Petugas K3 Kebakaran (Fire Safety Officer)",
    category: "KEMENAKER" as const,
    industryType: "Industri Manufaktur",
    description:
      "Program pelatihan dan sertifikasi petugas penanggulangan kebakaran kelas D (Madya). Peserta mendapatkan keterampilan pemadaman api, evakuasi darurat, pengelolaan APAR, dan prosedur tanggap darurat kebakaran.",
    sessions: [
      "Teori Api, Pembakaran, dan Klasifikasi Kebakaran",
      "Sistem Proteksi Kebakaran Aktif dan Pasif",
      "Penggunaan APAR dan Hydrant",
      "Prosedur Evakuasi dan Titik Kumpul",
      "Simulasi Penanggulangan Kebakaran (Praktik)",
    ],
    batches: [
      {
        startDate: new Date("2025-06-16"),
        endDate: new Date("2025-06-20"),
        quota: 30,
        price: 3000000,
        status: "OPEN" as const,
      },
      {
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-09-05"),
        quota: 30,
        price: 3000000,
        status: "OPEN" as const,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding dummy programs, batches, and sessions...\n");

  for (const prog of programs) {
    console.log(`📋 Creating program: ${prog.title}`);

    const program = await prisma.program.create({
      data: {
        title: prog.title,
        category: prog.category,
        industryType: prog.industryType,
        description: prog.description,
        isActive: true,
      },
    });

    for (let bi = 0; bi < prog.batches.length; bi++) {
      const batchData = prog.batches[bi];
      console.log(
        `  📦 Creating batch ${bi + 1}: ${batchData.startDate.toDateString()} → ${batchData.endDate.toDateString()}`
      );

      const batch = await prisma.batch.create({
        data: {
          programId: program.id,
          startDate: batchData.startDate,
          endDate: batchData.endDate,
          quota: batchData.quota,
          price: batchData.price,
          status: batchData.status,
        },
      });

      // Create 5 sessions, one per day (Mon-Fri)
      const batchStart = new Date(batchData.startDate);
      for (let si = 0; si < 5; si++) {
        const sessionDate = new Date(batchStart);
        sessionDate.setDate(batchStart.getDate() + si);

        const startTime = new Date(sessionDate);
        startTime.setHours(8, 0, 0, 0);

        const endTime = new Date(sessionDate);
        endTime.setHours(16, 0, 0, 0);

        console.log(
          `    📅 Session ${si + 1}: ${prog.sessions[si]} (${sessionDate.toDateString()})`
        );

        await prisma.classSession.create({
          data: {
            batchId: batch.id,
            title: prog.sessions[si],
            sessionDate,
            startTime,
            endTime,
            locationType: "Classroom",
            jp: 8,
          },
        });
      }
    }

    console.log(`  ✅ Program done!\n`);
  }

  console.log("🎉 Seeding complete! 3 programs × 2 batches × 5 sessions created.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
