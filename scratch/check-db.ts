import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const aiBrainCount = await prisma.$queryRaw`SELECT count(*) FROM "AiBrain"`;
    console.log("AiBrain table exists, count:", aiBrainCount);
    
    const articleCount = await prisma.$queryRaw`SELECT count(*) FROM "Article"`;
    console.log("Article table exists, count:", articleCount);
  } catch (err: any) {
    console.error("Database Check Failed:", err.message);
  }
}

main();
