import { BatchStatus, ProgramCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listProgramsAdmin() {
  return prisma.program.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      batches: {
        orderBy: {
          startDate: "asc"
        },
        include: {
          instructor: {
            select: {
              fullName: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              sessions: true
            }
          }
        }
      }
    }
  });
}

export async function findProgramById(programId: string) {
  return prisma.program.findUnique({
    where: {
      id: programId
    },
    include: {
      batches: {
        orderBy: {
          startDate: "asc"
        },
        include: {
          instructor: {
            select: {
              fullName: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              sessions: true
            }
          }
        }
      }
    }
  });
}

export async function createProgram(data: {
  title: string;
  category: ProgramCategory;
  industryType: string;
  description?: string | null;
  curriculum?: unknown;
  isActive?: boolean;
}) {
  return prisma.program.create({
    data: {
      title: data.title,
      category: data.category,
      industryType: data.industryType,
      description: data.description,
      curriculum: data.curriculum as never,
      isActive: data.isActive ?? true
    }
  });
}

export async function updateProgram(
  programId: string,
  data: {
    title?: string;
    category?: ProgramCategory;
    industryType?: string;
    description?: string | null;
    curriculum?: unknown;
    isActive?: boolean;
  }
) {
  return prisma.program.update({
    where: {
      id: programId
    },
    data: {
      title: data.title,
      category: data.category,
      industryType: data.industryType,
      description: data.description,
      curriculum: data.curriculum as never,
      isActive: data.isActive
    }
  });
}

export async function findActiveProgramsWithOpenBatches() {
  return prisma.program.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      batches: {
        where: {
          status: BatchStatus.OPEN
        },
        orderBy: {
          startDate: "asc"
        },
        include: {
          instructor: {
            select: {
              fullName: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        }
      }
    }
  });
}
