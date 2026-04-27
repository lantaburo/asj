import { BatchStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function findEnrollmentByBatchAndUser(batchId: string, userId: string) {
  return prisma.enrollment.findFirst({
    where: {
      batchId,
      userId
    }
  });
}

export async function listEnrollmentsAdmin() {
  return prisma.enrollment.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      batch: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          program: {
            select: {
              title: true,
              category: true
            }
          }
        }
      },
      _count: {
        select: {
          k3Logs: true
        }
      }
    }
  });
}

export async function findEnrollmentById(enrollmentId: string) {
  return prisma.enrollment.findUnique({
    where: {
      id: enrollmentId
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      batch: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          program: {
            select: {
              title: true,
              category: true
            }
          }
        }
      },
      k3Logs: {
        orderBy: {
          timestamp: "desc"
        },
        include: {
          verifiedBy: {
            select: {
              id: true,
              fullName: true,
              role: true
            }
          }
        }
      },
      _count: {
        select: {
          k3Logs: true
        }
      }
    }
  });
}

export async function findEnrollmentByQrCode(qrCode: string) {
  return prisma.enrollment.findUnique({
    where: {
      qrVerifyCode: qrCode
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      batch: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          program: {
            select: {
              title: true,
              category: true,
              industryType: true
            }
          }
        }
      },
      _count: {
        select: {
          k3Logs: true
        }
      }
    }
  });
}

export async function createEnrollment(input: {
  batchId: string;
  userId: string;
  registrationDocs?: Prisma.InputJsonValue;
}) {
  return prisma.enrollment.create({
    data: {
      batchId: input.batchId,
      userId: input.userId,
      registrationDocs: input.registrationDocs
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
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });
}

export async function createEnrollmentInOpenBatch(input: {
  batchId: string;
  userId: string;
  registrationDocs?: Prisma.InputJsonValue;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT "id"
      FROM "Batch"
      WHERE "id" = ${input.batchId}
      FOR UPDATE
    `;

    const batch = await tx.batch.findFirst({
      where: {
        id: input.batchId,
        status: BatchStatus.OPEN
      },
      select: {
        id: true,
        quota: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!batch) {
      return {
        status: "batch_not_open" as const
      };
    }

    const quotaRemaining = Math.max(batch.quota - batch._count.enrollments, 0);

    if (quotaRemaining <= 0) {
      return {
        status: "batch_full" as const
      };
    }

    const enrollment = await tx.enrollment.create({
      data: {
        batchId: input.batchId,
        userId: input.userId,
        registrationDocs: input.registrationDocs
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
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return {
      status: "created" as const,
      enrollment,
      quota: {
        total: batch.quota,
        remainingAfterRegistration: quotaRemaining - 1
      }
    };
  });
}

export async function updateEnrollmentAssessment(
  enrollmentId: string,
  data: {
    assessmentStatus?: "PENDING" | "KOMPETEN" | "BELUM_KOMPETEN";
    certificateNum?: string | null;
    expiryDate?: Date | null;
  }
) {
  return prisma.enrollment.update({
    where: {
      id: enrollmentId
    },
    data: {
      assessmentStatus: data.assessmentStatus,
      certificateNum: data.certificateNum,
      expiryDate: data.expiryDate
    }
  });
}
