import { BatchStatus } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import {
  createBatchSchema,
  updateBatchSchema
} from "@/features/batches/batch.schema";
import {
  createBatch,
  findBatchById,
  listBatchesAdmin,
  syncBatchStatuses,
  updateBatch,
  deleteBatch
} from "@/features/batches/batch.repository";
import { findProgramById } from "@/features/programs/program.repository";
import { findUserById } from "@/features/users/user.repository";

function inferBatchStatus(startDate: Date, endDate: Date, now: Date = new Date()) {
  if (endDate < now) {
    return BatchStatus.COMPLETED;
  }

  if (startDate <= now && endDate >= now) {
    return BatchStatus.ONGOING;
  }

  return BatchStatus.OPEN;
}

function mapBatchAdmin(batch: Awaited<ReturnType<typeof listBatchesAdmin>>[number]) {
  return {
    id: batch.id,
    startDate: batch.startDate.toISOString(),
    endDate: batch.endDate.toISOString(),
    quota: batch.quota,
    quotaRemaining: Math.max(batch.quota - batch._count.enrollments, 0),
    price: batch.price,
    pricePackages: batch.pricePackages,
    status: batch.status,
    program: batch.program,
    instructor: batch.instructor,
    assessor: batch.assessor,
    classroom: batch.classroom,
    enrollmentCount: batch._count.enrollments,
    sessionCount: batch._count.sessions
  };
}

async function ensureProgramExists(programId: string) {
  const program = await findProgramById(programId);

  if (!program) {
    throw new AppError("Program tidak ditemukan.", {
      statusCode: 404,
      code: "PROGRAM_NOT_FOUND"
    });
  }

  return program;
}

async function ensureInstructorExists(instructorId?: string | null) {
  if (!instructorId) {
    return null;
  }

  const user = await findUserById(instructorId);

  if (!user) {
    throw new AppError("Instruktur tidak ditemukan.", {
      statusCode: 404,
      code: "INSTRUCTOR_NOT_FOUND"
    });
  }

  return user;
}

export async function getAdminBatches() {
  await syncBatchStatuses();
  const batches = await listBatchesAdmin();

  return batches.map(mapBatchAdmin);
}

export async function getAdminBatchById(batchId: string) {
  await syncBatchStatuses();
  const batch = await findBatchById(batchId);

  if (!batch) {
    throw new AppError("Batch tidak ditemukan.", {
      statusCode: 404,
      code: "BATCH_NOT_FOUND"
    });
  }

  return mapBatchAdmin(batch);
}

export async function createBatchRecord(payload: unknown) {
  const parsed = createBatchSchema.parse(payload);

  await ensureProgramExists(parsed.programId);
  await ensureInstructorExists(parsed.instructorId ?? null);
  await ensureInstructorExists(parsed.assessorId ?? null);

  const status =
    parsed.status ?? inferBatchStatus(parsed.startDate, parsed.endDate);

  const batch = await createBatch({
    title: parsed.title ?? null,
    programId: parsed.programId,
    instructorId: parsed.instructorId ?? null,
    assessorId: parsed.assessorId ?? null,
    classroomId: parsed.classroomId ?? null,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    quota: parsed.quota,
    price: parsed.price ?? null,
    pricePackages: (parsed as any).pricePackages ?? null,
    status
  });

  return getAdminBatchById(batch.id);
}

export async function updateBatchRecord(batchId: string, payload: unknown) {
  const parsed = updateBatchSchema.parse(payload);
  const existingBatch = await findBatchById(batchId);

  if (!existingBatch) {
    throw new AppError("Batch tidak ditemukan.", {
      statusCode: 404,
      code: "BATCH_NOT_FOUND"
    });
  }

  if (parsed.programId) {
    await ensureProgramExists(parsed.programId);
  }

  if (parsed.instructorId !== undefined) {
    await ensureInstructorExists(parsed.instructorId ?? null);
  }

  const nextStartDate = parsed.startDate ?? existingBatch.startDate;
  const nextEndDate = parsed.endDate ?? existingBatch.endDate;

  if (nextEndDate <= nextStartDate) {
    throw new AppError("Tanggal akhir batch harus setelah tanggal mulai.", {
      statusCode: 400,
      code: "INVALID_BATCH_RANGE"
    });
  }

  const status =
    parsed.status ?? inferBatchStatus(nextStartDate, nextEndDate);

  await updateBatch(batchId, {
    programId: parsed.programId,
    instructorId:
      parsed.instructorId === undefined ? undefined : (parsed.instructorId ?? null),
    assessorId:
      parsed.assessorId === undefined ? undefined : (parsed.assessorId ?? null),
    classroomId:
      parsed.classroomId === undefined ? undefined : (parsed.classroomId ?? null),
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    quota: parsed.quota,
    price: parsed.price === undefined ? undefined : (parsed.price ?? null),
    pricePackages: (parsed as any).pricePackages,
    status
  });

  return getAdminBatchById(batchId);
}

export async function deleteBatchRecord(batchId: string) {
  const existingBatch = await findBatchById(batchId);

  if (!existingBatch) {
    throw new AppError("Batch tidak ditemukan.", {
      statusCode: 404,
      code: "BATCH_NOT_FOUND"
    });
  }

  await deleteBatch(batchId);
}
