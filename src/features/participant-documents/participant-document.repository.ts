import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getParticipantDocumentState(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      participantDocuments: true
    }
  });
}

export async function updateParticipantDocumentState(
  userId: string,
  participantDocuments: Prisma.InputJsonValue
) {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      participantDocuments
    },
    select: {
      participantDocuments: true
    }
  });
}
