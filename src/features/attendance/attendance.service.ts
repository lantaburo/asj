import { Prisma } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import {
  attendanceScanSchema
} from "@/features/attendance/attendance.schema";
import {
  createAttendance,
  findSessionById
} from "@/features/attendance/attendance.repository";
import { findEnrollmentByBatchAndUser } from "@/features/enrollments/enrollment.repository";
import { ensureActiveUser } from "@/features/users/user.service";

export async function scanAttendance(payload: unknown, currentUserId: string) {
  const parsed = attendanceScanSchema.parse(payload);

  const session = await findSessionById(parsed.sessionId);

  if (!session) {
    throw new AppError("Session tidak ditemukan.", {
      statusCode: 404,
      code: "SESSION_NOT_FOUND"
    });
  }

  const user = await ensureActiveUser(currentUserId);
  const enrollment = await findEnrollmentByBatchAndUser(session.batch.id, user.id);

  if (!enrollment) {
    throw new AppError("Peserta belum terdaftar pada batch session ini.", {
      statusCode: 409,
      code: "ENROLLMENT_REQUIRED"
    });
  }

  try {
    const attendance = await createAttendance({
      sessionId: session.id,
      userId: user.id,
      gpsCoordinates: parsed.gpsCoordinates as Prisma.InputJsonValue,
      selfieUrl: parsed.selfieUrl,
      deviceInfo: parsed.deviceInfo,
      status: parsed.status
    });

    return {
      attendance
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Kehadiran untuk sesi ini sudah pernah direkam.", {
        statusCode: 409,
        code: "DUPLICATE_ATTENDANCE"
      });
    }

    throw error;
  }
}
