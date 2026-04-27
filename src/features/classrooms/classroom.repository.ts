import { prisma } from "@/lib/prisma";

export async function listClassrooms() {
  return prisma.classroom.findMany({
    orderBy: {
      roomName: "asc"
    },
    include: {
      _count: {
        select: {
          sessions: true
        }
      }
    }
  });
}

export async function findClassroomById(classroomId: string) {
  return prisma.classroom.findUnique({
    where: {
      id: classroomId
    },
    include: {
      sessions: {
        orderBy: {
          sessionDate: "asc"
        },
        select: {
          id: true,
          title: true,
          sessionDate: true,
          startTime: true,
          endTime: true
        }
      },
      _count: {
        select: {
          sessions: true
        }
      }
    }
  });
}

export async function createClassroom(data: {
  roomName: string;
  capacity: number;
  facilities?: unknown;
  isAvailable?: boolean;
}) {
  return prisma.classroom.create({
    data: {
      roomName: data.roomName,
      capacity: data.capacity,
      facilities: data.facilities as never,
      isAvailable: data.isAvailable ?? true
    }
  });
}

export async function updateClassroom(
  classroomId: string,
  data: {
    roomName?: string;
    capacity?: number;
    facilities?: unknown;
    isAvailable?: boolean;
  }
) {
  return prisma.classroom.update({
    where: {
      id: classroomId
    },
    data: {
      roomName: data.roomName,
      capacity: data.capacity,
      facilities: data.facilities as never,
      isAvailable: data.isAvailable
    }
  });
}
