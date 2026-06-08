import { PrismaClient, ProgramCategory, BatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

const programs = [
  {
    title: "Pengawas Operasional Madya (POM)",
    category: ProgramCategory.BNSP,
    industryType: "Pertambangan",
    description: "Diklat & Uji Kompetensi Pengawas Operasional Madya (POM) bersertifikat BNSP untuk jenjang karir yang lebih tinggi di bidang pengawasan operasional pertambangan.",
    batches: [
      { start: "2026-07-07", end: "2026-07-11", price: 4500000 },
      { start: "2026-07-21", end: "2026-07-25", price: 4500000 },
    ],
  },
  {
    title: "Pengawas Operasional Utama (POU)",
    category: ProgramCategory.BNSP,
    industryType: "Pertambangan",
    description: "Diklat & Uji Kompetensi Pengawas Operasional Utama (POU) bersertifikat BNSP — jenjang tertinggi kompetensi pengawasan operasional pertambangan.",
    batches: [
      { start: "2026-08-03", end: "2026-08-07", price: 5500000 },
      { start: "2026-08-17", end: "2026-08-21", price: 5500000 },
    ],
  },
  {
    title: "K3 Umum (Ahli K3 Muda)",
    category: ProgramCategory.KEMENAKER,
    industryType: "Umum",
    description: "Pelatihan dan sertifikasi Ahli K3 Umum resmi KEMENAKER RI. Wajib bagi personel K3 di perusahaan dengan lebih dari 100 tenaga kerja atau menggunakan bahan berbahaya.",
    batches: [
      { start: "2026-06-16", end: "2026-06-20", price: 3000000 },
      { start: "2026-07-14", end: "2026-07-18", price: 3000000 },
      { start: "2026-08-11", end: "2026-08-15", price: 3000000 },
    ],
  },
  {
    title: "K3 Listrik",
    category: ProgramCategory.KEMENAKER,
    industryType: "Kelistrikan",
    description: "Pelatihan K3 Listrik resmi KEMENAKER RI untuk teknisi dan pengawas instalasi listrik di industri. Mencakup keselamatan instalasi, pemeliharaan, dan penanganan darurat.",
    batches: [
      { start: "2026-06-23", end: "2026-06-27", price: 3500000 },
      { start: "2026-07-28", end: "2026-08-01", price: 3500000 },
    ],
  },
  {
    title: "K3 Konstruksi",
    category: ProgramCategory.KEMENAKER,
    industryType: "Konstruksi",
    description: "Pelatihan dan sertifikasi K3 Konstruksi KEMENAKER RI. Dirancang untuk pengawas dan pelaksana proyek konstruksi agar memenuhi standar keselamatan kerja nasional.",
    batches: [
      { start: "2026-07-06", end: "2026-07-10", price: 3200000 },
      { start: "2026-08-03", end: "2026-08-07", price: 3200000 },
    ],
  },
  {
    title: "Auditor SMK3",
    category: ProgramCategory.AUDIT,
    industryType: "Umum",
    description: "Pelatihan Auditor Sistem Manajemen K3 (SMK3) sesuai PP No. 50 Tahun 2012. Membekali peserta kemampuan audit internal dan eksternal SMK3 di perusahaan.",
    batches: [
      { start: "2026-07-20", end: "2026-07-24", price: 6000000 },
    ],
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const p of programs) {
    const existing = await prisma.program.findFirst({
      where: { title: p.title },
    });

    if (existing) {
      console.log(`⏭  Skip: "${p.title}" sudah ada`);
      skipped++;
      continue;
    }

    const program = await prisma.program.create({
      data: {
        title: p.title,
        category: p.category,
        industryType: p.industryType,
        description: p.description,
        isActive: true,
        batches: {
          create: p.batches.map((b) => ({
            startDate: new Date(b.start),
            endDate: new Date(b.end),
            quota: 30,
            price: b.price,
            status: BatchStatus.OPEN,
          })),
        },
      },
      include: { batches: true },
    });

    console.log(`✓ "${program.title}" — ${program.batches.length} batch`);
    created++;
  }

  console.log(`\nSelesai: ${created} program dibuat, ${skipped} di-skip.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
