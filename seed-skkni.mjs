import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const schemaTitle = "SKKNI Ahli K3 Umum";
  const schemaCode = "SKKNI-K3-UMUM";
  
  let unitSchema = await prisma.unitSchema.findUnique({
    where: { code: schemaCode }
  });

  if (!unitSchema) {
    unitSchema = await prisma.unitSchema.create({
      data: {
        code: schemaCode,
        title: schemaTitle,
        level: "Ahli / Level 6",
        description: "Standar Kompetensi Kerja Nasional Indonesia untuk Ahli Keselamatan dan Kesehatan Kerja (K3) Umum berdasarkan Kepmenaker.",
        isActive: true,
      }
    });
    console.log(`Created UnitSchema: ${unitSchema.title}`);
  } else {
    console.log(`UnitSchema already exists: ${unitSchema.title}`);
  }

  const units = [
    { code: "M.711000.001.01", title: "Merancang Strategi Pengendalian Risiko K3 di Tempat Kerja" },
    { code: "M.711000.002.01", title: "Merancang Sistem Tanggap Darurat" },
    { code: "M.711000.003.01", title: "Melakukan Komunikasi K3" },
    { code: "M.711000.004.01", title: "Mengawasi Pelaksanaan Izin Kerja" },
    { code: "M.711000.005.01", title: "Melakukan Pengukuran Faktor Bahaya di Tempat Kerja" },
    { code: "M.711000.006.01", title: "Mengelola Pertolongan Pertama Pada Kecelakaan (P3K) di Tempat Kerja" },
    { code: "M.711000.007.01", title: "Mengelola Tindakan Tanggap Darurat" },
    { code: "M.711000.008.01", title: "Mengevaluasi Pemenuhan Persyaratan dan Prosedur K3" },
    { code: "M.711000.009.01", title: "Melakukan Investigasi Kecelakaan Kerja" }
  ];

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    
    const existing = await prisma.schemaUnit.findUnique({
      where: {
        unitSchemaId_unitCode: {
          unitSchemaId: unitSchema.id,
          unitCode: u.code
        }
      }
    });

    if (!existing) {
      await prisma.schemaUnit.create({
        data: {
          unitSchemaId: unitSchema.id,
          unitCode: u.code,
          title: u.title,
          orderIndex: i + 1,
          isMandatory: true
        }
      });
      console.log(`Created unit: ${u.code} - ${u.title}`);
    } else {
      console.log(`Unit already exists: ${u.code}`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
