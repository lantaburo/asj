import type { PublicProgramDto } from "@/features/programs/program.types";
import { AppError } from "@/lib/app-error";
import { syncBatchStatuses } from "@/features/batches/batch.repository";
import {
  createProgramSchema,
  updateProgramSchema
} from "@/features/programs/program.schema";
import {
  createProgram,
  findActiveProgramsWithOpenBatches,
  findProgramById,
  listProgramsAdmin,
  updateProgram
} from "@/features/programs/program.repository";

function mapAdminProgram(program: Awaited<ReturnType<typeof listProgramsAdmin>>[number]) {
  return {
    id: program.id,
    title: program.title,
    category: program.category,
    industryType: program.industryType,
    description: program.description,
    curriculum: program.curriculum,
    isActive: program.isActive,
    batchCount: program.batches.length,
    batches: program.batches.map((batch) => ({
      id: batch.id,
      startDate: batch.startDate.toISOString(),
      endDate: batch.endDate.toISOString(),
      quota: batch.quota,
      quotaRemaining: Math.max(batch.quota - batch._count.enrollments, 0),
      price: batch.price,
      status: batch.status,
      instructorName: batch.instructor?.fullName ?? null,
      enrollmentCount: batch._count.enrollments,
      sessionCount: batch._count.sessions
    }))
  };
}

export async function getAdminPrograms() {
  await syncBatchStatuses();
  const programs = await listProgramsAdmin();

  return programs.map(mapAdminProgram);
}

export async function getAdminProgramById(programId: string) {
  await syncBatchStatuses();
  const program = await findProgramById(programId);

  if (!program) {
    throw new AppError("Program tidak ditemukan.", {
      statusCode: 404,
      code: "PROGRAM_NOT_FOUND"
    });
  }

  return mapAdminProgram(program);
}

export async function createProgramRecord(payload: unknown) {
  const parsed = createProgramSchema.parse(payload);
  const program = await createProgram(parsed);

  return getAdminProgramById(program.id);
}

export async function updateProgramRecord(programId: string, payload: unknown) {
  const parsed = updateProgramSchema.parse(payload);
  const existing = await findProgramById(programId);

  if (!existing) {
    throw new AppError("Program tidak ditemukan.", {
      statusCode: 404,
      code: "PROGRAM_NOT_FOUND"
    });
  }

  await updateProgram(programId, parsed);
  return getAdminProgramById(programId);
}

export async function getPublicPrograms(): Promise<PublicProgramDto[]> {
  await syncBatchStatuses();
  const programs = await findActiveProgramsWithOpenBatches();

  return programs.map((program) => ({
    id: program.id,
    title: program.title,
    category: program.category,
    industryType: program.industryType,
    description: program.description,
    openBatches: program.batches.map((batch) => ({
      id: batch.id,
      startDate: batch.startDate.toISOString(),
      endDate: batch.endDate.toISOString(),
      quota: batch.quota,
      quotaRemaining: Math.max(batch.quota - batch._count.enrollments, 0),
      price: batch.price,
      status: batch.status,
      instructorName: batch.instructor?.fullName ?? null
    }))
  }));
}
