import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listK3Logs() {
  return prisma.k3Log.findMany({
    orderBy: {
      timestamp: "desc"
    },
    include: {
      enrollment: {
        select: {
          id: true,
          qrVerifyCode: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
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
      },
      verifiedBy: {
        select: {
          id: true,
          fullName: true,
          role: true
        }
      }
    }
  });
}

export async function findK3LogById(logId: string) {
  return prisma.k3Log.findUnique({
    where: {
      id: logId
    },
    include: {
      enrollment: {
        select: {
          id: true,
          qrVerifyCode: true,
          user: {
            select: {
              id: true,
              fullName: true
            }
          },
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
      },
      verifiedBy: {
        select: {
          id: true,
          fullName: true,
          role: true
        }
      }
    }
  });
}

export async function createK3Log(data: {
  enrollmentId: string;
  activityName: string;
  safetyScore?: number;
  verifiedById?: string;
  evidenceUrl?: string | null;
  gpsWatermark?: Prisma.InputJsonValue;
}) {
  return prisma.k3Log.create({
    data: {
      enrollmentId: data.enrollmentId,
      activityName: data.activityName,
      safetyScore: data.safetyScore,
      verifiedById: data.verifiedById,
      evidenceUrl: data.evidenceUrl,
      gpsWatermark: data.gpsWatermark
    }
  });
}

export async function updateK3Log(
  logId: string,
  data: {
    activityName?: string;
    safetyScore?: number;
    verifiedById?: string;
    evidenceUrl?: string | null;
    gpsWatermark?: Prisma.InputJsonValue;
  }
) {
  return prisma.k3Log.update({
    where: {
      id: logId
    },
    data: {
      activityName: data.activityName,
      safetyScore: data.safetyScore,
      verifiedById: data.verifiedById,
      evidenceUrl: data.evidenceUrl,
      gpsWatermark: data.gpsWatermark
    }
  });
}
