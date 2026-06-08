import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getWeekdaysBetween(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

async function main() {
  const batches = await prisma.batch.findMany({
    include: { program: { select: { title: true } } },
    orderBy: { startDate: "asc" }
  });

  console.log(`Found ${batches.length} batches\n`);
  let totalCreated = 0;

  for (const batch of batches) {
    const existing = await prisma.classSession.count({ where: { batchId: batch.id } });
    if (existing > 0) {
      console.log(`⏭  Skip: ${batch.program.title} (${batch.startDate.toISOString().slice(0, 10)}) — ${existing} sesi sudah ada`);
      continue;
    }

    const weekdays = getWeekdaysBetween(batch.startDate, batch.endDate);

    for (let i = 0; i < weekdays.length; i++) {
      const date = weekdays[i];
      const startTime = new Date(date);
      startTime.setHours(8, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(16, 0, 0, 0);

      await prisma.classSession.create({
        data: {
          batchId: batch.id,
          title: `Hari ${i + 1} — ${batch.program.title}`,
          sessionDate: date,
          startTime,
          endTime,
          locationType: "Classroom",
          jp: 8
        }
      });
      totalCreated++;
    }

    console.log(
      `✓  ${batch.program.title} (${batch.startDate.toISOString().slice(0, 10)} – ${batch.endDate.toISOString().slice(0, 10)}) → ${weekdays.length} sesi dibuat`
    );
  }

  console.log(`\nTotal sesi dibuat: ${totalCreated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
