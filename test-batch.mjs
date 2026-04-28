import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const programs = await prisma.program.findMany();
  console.log("Programs count:", programs.length);
  if (programs.length > 0) {
    console.log("First program:", programs[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
