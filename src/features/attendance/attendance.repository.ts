import type { AttendanceStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function findSessionById(sessionId: string) {
  return prisma.classSession.findUnique({
    where: {
      id: sessionId
    },
    include: {
      batch: {
        select: {
          id: true,
          program: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });
}

export async function createAttendance(input: {
  sessionId: string;
  userId: string;
  gpsCoordinates: Prisma.InputJsonValue;
  selfieUrl?: string;
  deviceInfo?: string;
  status?: AttendanceStatus;
}) {
  return prisma.attendance.create({
    data: {
      sessionId: input.sessionId,
      userId: input.userId,
      gpsCoordinates: input.gpsCoordinates,
      selfieUrl: input.selfieUrl,
      deviceInfo: input.deviceInfo,
      status: input.status
    },
    include: {
      session: {
        select: {
          id: true,
          title: true,
          sessionDate: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true
        }
      }
    }
  });
}
