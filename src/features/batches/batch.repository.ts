import { BatchStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function syncBatchStatuses(now: Date = new Date()) {
  await prisma.$transaction([
    prisma.batch.updateMany({
      where: {
        startDate: {
          gt: now
        },
        NOT: {
          status: BatchStatus.OPEN
        }
      },
      data: {
        status: BatchStatus.OPEN
      }
    }),
    prisma.batch.updateMany({
      where: {
        startDate: {
          lte: now
        },
        endDate: {
          gte: now
        },
        NOT: {
          status: BatchStatus.ONGOING
        }
      },
      data: {
        status: BatchStatus.ONGOING
      }
    }),
    prisma.batch.updateMany({
      where: {
        endDate: {
          lt: now
        },
        NOT: {
          status: BatchStatus.COMPLETED
        }
      },
      data: {
        status: BatchStatus.COMPLETED
      }
    })
  ]);
}

export async function listBatchesAdmin() {
  return prisma.batch.findMany({
    orderBy: {
      startDate: "asc"
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          category: true,
          industryType: true
        }
      },
      instructor: {
        select: { id: true, fullName: true, email: true }
      },
      assessor: {
        select: { id: true, fullName: true, email: true }
      },
      classroom: {
        select: { id: true, roomName: true }
      },
      _count: {
        select: { enrollments: true, sessions: true }
      }
    }
  });
}

export async function findBatchById(batchId: string) {
  return prisma.batch.findUnique({
    where: {
      id: batchId
    },
    include: {
      program: {
        select: { id: true, title: true, category: true, industryType: true }
      },
      instructor: {
        select: { id: true, fullName: true, email: true }
      },
      assessor: {
        select: { id: true, fullName: true, email: true }
      },
      classroom: {
        select: { id: true, roomName: true }
      },
      _count: {
        select: { enrollments: true, sessions: true }
      }
    }
  });
}

export async function createBatch(data: {
  programId: string;
  instructorId?: string | null;
  assessorId?: string | null;
  startDate: Date;
  endDate: Date;
  quota: number;
  price?: number | null;
  status: BatchStatus;
  classroomId?: string | null;
  pricePackages?: any;
}) {
  return prisma.batch.create({
    data: {
      programId: data.programId,
      instructorId: data.instructorId,
      assessorId: data.assessorId,
      classroomId: data.classroomId,
      startDate: data.startDate,
      endDate: data.endDate,
      quota: data.quota,
      price: data.price,
      pricePackages: data.pricePackages,
      status: data.status
    }
  });
}

export async function updateBatch(
  batchId: string,
  data: {
    programId?: string;
    instructorId?: string | null;
    assessorId?: string | null;
    startDate?: Date;
    endDate?: Date;
    quota?: number;
    price?: number | null;
    status?: BatchStatus;
    classroomId?: string | null;
    pricePackages?: any;
  }
) {
  return prisma.batch.update({
    where: { id: batchId },
    data: {
      programId: data.programId,
      instructorId: data.instructorId,
      assessorId: data.assessorId,
      classroomId: data.classroomId,
      startDate: data.startDate,
      endDate: data.endDate,
      quota: data.quota,
      price: data.price,
      pricePackages: data.pricePackages,
      status: data.status
    }
  });
}

export async function findOpenBatchById(batchId: string) {
  return prisma.batch.findFirst({
    where: {
      id: batchId,
      status: BatchStatus.OPEN
    },
    include: {
      _count: {
        select: {
          enrollments: true
        }
      },
      program: {
        select: {
          id: true,
          title: true,
          category: true
        }
      }
    }
  });
}

export async function deleteBatch(batchId: string) {
  return prisma.batch.delete({
    where: { id: batchId }
  });
}
