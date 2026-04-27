import type { Prisma } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import {
  createK3LogSchema,
  updateK3LogSchema
} from "@/features/k3-logs/k3-log.schema";
import {
  createK3Log,
  findK3LogById,
  listK3Logs,
  updateK3Log
} from "@/features/k3-logs/k3-log.repository";
import { findEnrollmentById } from "@/features/enrollments/enrollment.repository";
import { ensureVerifierUser } from "@/features/users/user.service";

function mapK3Log(log: Awaited<ReturnType<typeof listK3Logs>>[number]) {
  return {
    id: log.id,
    activityName: log.activityName,
    safetyScore: log.safetyScore,
    evidenceUrl: log.evidenceUrl,
    gpsWatermark: log.gpsWatermark,
    timestamp: log.timestamp.toISOString(),
    enrollment: {
      id: log.enrollment.id
    },
    verifiedBy: log.verifiedBy ? {
      id: log.verifiedBy.id,
      fullName: log.verifiedBy.fullName
    } : null
  };
}

async function ensureEnrollmentExists(enrollmentId: string) {
  const enrollment = await findEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new AppError("Enrollment untuk K3 log tidak ditemukan.", {
      statusCode: 404,
      code: "ENROLLMENT_NOT_FOUND"
    });
  }

  return enrollment;
}

export async function getK3LogList() {
  const logs = await listK3Logs();
  return logs.map(mapK3Log);
}

export async function getK3LogDetail(logId: string) {
  const log = await findK3LogById(logId);

  if (!log) {
    throw new AppError("K3 log tidak ditemukan.", {
      statusCode: 404,
      code: "K3_LOG_NOT_FOUND"
    });
  }

  return mapK3Log(log);
}

export async function createK3LogRecord(payload: unknown, verifiedById: string) {
  const parsed = createK3LogSchema.parse(payload);
  await ensureVerifierUser(verifiedById);
  await ensureEnrollmentExists(parsed.enrollmentId);

  const log = await createK3Log({
    enrollmentId: parsed.enrollmentId,
    activityName: parsed.activityName,
    safetyScore: parsed.safetyScore,
    verifiedById,
    evidenceUrl: parsed.evidenceUrl ?? null,
    gpsWatermark: parsed.gpsWatermark as Prisma.InputJsonValue | undefined
  });

  return getK3LogDetail(log.id);
}

export async function updateK3LogRecord(
  logId: string,
  payload: unknown,
  verifiedById: string
) {
  const parsed = updateK3LogSchema.parse(payload);
  await ensureVerifierUser(verifiedById);
  const existing = await findK3LogById(logId);

  if (!existing) {
    throw new AppError("K3 log tidak ditemukan.", {
      statusCode: 404,
      code: "K3_LOG_NOT_FOUND"
    });
  }

  await updateK3Log(logId, {
    activityName: parsed.activityName,
    safetyScore: parsed.safetyScore,
    verifiedById: parsed.verified ? verifiedById : undefined,
    evidenceUrl:
      parsed.evidenceUrl === undefined ? undefined : (parsed.evidenceUrl ?? null),
    gpsWatermark: parsed.gpsWatermark as Prisma.InputJsonValue | undefined
  });

  return getK3LogDetail(logId);
}
