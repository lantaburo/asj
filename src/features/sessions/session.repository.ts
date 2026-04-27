import { prisma } from "@/lib/prisma";

export async function listSessionsAdmin() {
  return prisma.classSession.findMany({
    orderBy: {
      sessionDate: "asc"
    },
    include: {
      batch: {
        select: {
          id: true,
          status: true,
          program: {
            select: {
              title: true
            }
          }
        }
      },
      classroom: {
        select: {
          id: true,
          roomName: true
        }
      },
      instructor: {
        select: {
          id: true,
          fullName: true
        }
      },
      _count: {
        select: {
          attendances: true
        }
      }
    }
  });
}

export async function findSessionByIdForAdmin(sessionId: string) {
  return prisma.classSession.findUnique({
    where: {
      id: sessionId
    },
    include: {
      batch: {
        select: {
          id: true,
          status: true,
          program: {
            select: {
              title: true
            }
          }
        }
      },
      classroom: {
        select: {
          id: true,
          roomName: true
        }
      },
      instructor: {
        select: {
          id: true,
          fullName: true
        }
      },
      _count: {
        select: {
          attendances: true
        }
      }
    }
  });
}

export async function createSession(data: {
  batchId: string;
  classroomId?: string | null;
  instructorId?: string | null;
  title: string;
  sessionDate: Date;
  startTime: Date;
  endTime: Date;
  locationType: string;
}) {
  return prisma.classSession.create({
    data: {
      batchId: data.batchId,
      classroomId: data.classroomId,
      instructorId: data.instructorId,
      title: data.title,
      sessionDate: data.sessionDate,
      startTime: data.startTime,
      endTime: data.endTime,
      locationType: data.locationType
    }
  });
}

export async function updateSession(
  sessionId: string,
  data: {
    batchId?: string;
    classroomId?: string | null;
    instructorId?: string | null;
    title?: string;
    sessionDate?: Date;
    startTime?: Date;
    endTime?: Date;
    locationType?: string;
  }
) {
  return prisma.classSession.update({
    where: {
      id: sessionId
    },
    data: {
      batchId: data.batchId,
      classroomId: data.classroomId,
      instructorId: data.instructorId,
      title: data.title,
      sessionDate: data.sessionDate,
      startTime: data.startTime,
      endTime: data.endTime,
      locationType: data.locationType
    }
  });
}
