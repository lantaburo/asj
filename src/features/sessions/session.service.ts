import { AppError } from "@/lib/app-error";
import { findBatchById } from "@/features/batches/batch.repository";
import { findClassroomById } from "@/features/classrooms/classroom.repository";
import {
  createSessionSchema,
  updateSessionSchema
} from "@/features/sessions/session.schema";
import {
  createSession,
  findSessionByIdForAdmin,
  listSessionsAdmin,
  updateSession,
  deleteSession
} from "@/features/sessions/session.repository";
import { findUserById } from "@/features/users/user.repository";

function mapSession(session: Awaited<ReturnType<typeof listSessionsAdmin>>[number]) {
  return {
    id: session.id,
    title: session.title,
    sessionDate: session.sessionDate.toISOString(),
    startTime: session.startTime.toISOString(),
    endTime: session.endTime.toISOString(),
    locationType: session.locationType,
    attendanceCount: session._count.attendances,
    batch: session.batch,
    classroom: session.classroom,
    instructor: session.instructor,
    assessor: session.assessor,
    attendances: session.attendances.map(a => ({
      id: a.id,
      checkInTime: a.checkInTime.toISOString(),
      status: a.status,
      userName: a.user.fullName,
      userEmail: a.user.email
    }))
  };
}

async function ensureBatchExists(batchId: string) {
  const batch = await findBatchById(batchId);

  if (!batch) {
    throw new AppError("Batch tidak ditemukan.", {
      statusCode: 404,
      code: "BATCH_NOT_FOUND"
    });
  }

  return batch;
}

async function ensureClassroomExists(classroomId?: string | null) {
  if (!classroomId) {
    return null;
  }

  const classroom = await findClassroomById(classroomId);

  if (!classroom) {
    throw new AppError("Classroom tidak ditemukan.", {
      statusCode: 404,
      code: "CLASSROOM_NOT_FOUND"
    });
  }

  return classroom;
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

export async function getSessionList() {
  const sessions = await listSessionsAdmin();
  return sessions.map(mapSession);
}

export async function getSessionDetail(sessionId: string) {
  const session = await findSessionByIdForAdmin(sessionId);

  if (!session) {
    throw new AppError("Session tidak ditemukan.", {
      statusCode: 404,
      code: "SESSION_NOT_FOUND"
    });
  }

  return mapSession(session);
}

export async function createSessionRecord(payload: unknown) {
  const parsed = createSessionSchema.parse(payload);

  await ensureBatchExists(parsed.batchId);
  await ensureClassroomExists(parsed.classroomId ?? null);
  await ensureInstructorExists(parsed.instructorId ?? null);
  await ensureInstructorExists(parsed.assessorId ?? null);

  const session = await createSession({
    batchId: parsed.batchId,
    classroomId: parsed.classroomId ?? null,
    instructorId: parsed.instructorId ?? null,
    assessorId: parsed.assessorId ?? null,
    title: parsed.title,
    sessionDate: parsed.sessionDate,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    locationType: parsed.locationType ?? "Classroom"
  });

  return getSessionDetail(session.id);
}

export async function updateSessionRecord(sessionId: string, payload: unknown) {
  const parsed = updateSessionSchema.parse(payload);
  const existing = await findSessionByIdForAdmin(sessionId);

  if (!existing) {
    throw new AppError("Session tidak ditemukan.", {
      statusCode: 404,
      code: "SESSION_NOT_FOUND"
    });
  }

  if (parsed.batchId) {
    await ensureBatchExists(parsed.batchId);
  }

  if (parsed.classroomId !== undefined) {
    await ensureClassroomExists(parsed.classroomId ?? null);
  }

  if (parsed.instructorId !== undefined) {
    await ensureInstructorExists(parsed.instructorId ?? null);
  }

  if (parsed.assessorId !== undefined) {
    await ensureInstructorExists(parsed.assessorId ?? null);
  }

  const nextStartTime = parsed.startTime ?? existing.startTime;
  const nextEndTime = parsed.endTime ?? existing.endTime;

  if (nextEndTime <= nextStartTime) {
    throw new AppError("Waktu selesai harus setelah waktu mulai.", {
      statusCode: 400,
      code: "INVALID_SESSION_RANGE"
    });
  }

  await updateSession(sessionId, {
    batchId: parsed.batchId,
    classroomId:
      parsed.classroomId === undefined ? undefined : (parsed.classroomId ?? null),
    instructorId:
      parsed.instructorId === undefined ? undefined : (parsed.instructorId ?? null),
    assessorId:
      parsed.assessorId === undefined ? undefined : (parsed.assessorId ?? null),
    title: parsed.title,
    sessionDate: parsed.sessionDate,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    locationType: parsed.locationType
  });

  return getSessionDetail(sessionId);
}

export async function deleteSessionRecord(sessionId: string) {
  const existing = await findSessionByIdForAdmin(sessionId);

  if (!existing) {
    throw new AppError("Session tidak ditemukan.", {
      statusCode: 404,
      code: "SESSION_NOT_FOUND"
    });
  }

  await deleteSession(sessionId);
}
