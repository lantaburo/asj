import { PrismaClient, ProgramCategory, BatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.program.findFirst({
    where: { title: { contains: "Pengawas Operasional Pertama" } },
  });

  if (existing) {
    console.log("Program POP sudah ada, skip.");
    return;
  }

  const program = await prisma.program.create({
    data: {
      title: "Pengawas Operasional Pertama (POP)",
      category: ProgramCategory.BNSP,
      industryType: "Pertambangan",
      description:
        "Diklat & Uji Kompetensi Pengawas Operasional Pertama (POP) bersertifikat BNSP. Tingkatkan kompetensi dan raih pengakuan resmi untuk karir yang lebih profesional di bidang keselamatan operasional.",
      isActive: true,
      batches: {
        create: [
          {
            startDate: new Date("2026-06-12"),
            endDate: new Date("2026-06-16"),
            quota: 30,
            price: 3500000,
            status: BatchStatus.OPEN,
          },
          {
            startDate: new Date("2026-06-20"),
            endDate: new Date("2026-06-24"),
            quota: 30,
            price: 3500000,
            status: BatchStatus.OPEN,
          },
          {
            startDate: new Date("2026-06-26"),
            endDate: new Date("2026-06-30"),
            quota: 30,
            price: 3500000,
            status: BatchStatus.OPEN,
          },
        ],
      },
    },
    include: { batches: true },
  });

  console.log(`✓ Program "${program.title}" berhasil dibuat`);
  console.log(`  ID: ${program.id}`);
  console.log(`  Batch:`);
  program.batches.forEach((b, i) => {
    const start = b.startDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const end = b.endDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    console.log(`    ${i + 1}. ${start} – ${end} | Kuota: ${b.quota} | Harga: Rp ${b.price?.toLocaleString("id-ID")}`);
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
