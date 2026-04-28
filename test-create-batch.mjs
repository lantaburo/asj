import { createBatchRecord } from './src/features/batches/batch.service.ts';
import { PrismaClient } from '@prisma/client';

async function main() {
  try {
    const batch = await createBatchRecord({
      programId: "d30c1fe3-f267-4cbd-9299-d59d6599398e",
      classroomId: "",
      startDate: "2026-04-28T12:00",
      endDate: "2026-04-29T12:00",
      quota: "10",
      price: ""
    });
    console.log("Success:", batch);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
