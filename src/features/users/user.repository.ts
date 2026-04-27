import type { InstructorLevel, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type FindUserIdentityParams = {
  email?: string;
  phone?: string;
};

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export async function findUserByIdentity(params: FindUserIdentityParams) {
  const conditions: FindUserIdentityParams[] = [];

  if (params.email) {
    conditions.push({
      email: params.email
    });
  }

  if (params.phone) {
    conditions.push({
      phone: params.phone
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      OR: conditions
    }
  });
}

export async function createUser(input: {
  email: string;
  phone?: string;
  fullName: string;
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      fullName: input.fullName
    }
  });
}

export async function listInternalMembers() {
  return prisma.user.findMany({
    where: {
      role: {
        in: [
          "SUPER_ADMIN",
          "ADMIN",
          "INSTRUCTOR",
          "ASSESSOR",
          "CLIENT_HR",
          "AUDITOR"
        ]
      }
    },
    orderBy: [
      {
        role: "asc"
      },
      {
        fullName: "asc"
      }
    ]
  });
}

export async function createInternalMember(input: {
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  instructorLevel?: InstructorLevel | null;
  passwordHash?: string | null;
  isActive?: boolean;
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
      instructorLevel: input.instructorLevel,
      passwordHash: input.passwordHash ?? null,
      isActive: input.isActive ?? true
    }
  });
}

export async function upsertInternalUserByEmail(input: {
  email: string;
  fullName: string;
  role: Role;
  passwordHash: string;
  isActive?: boolean;
}) {
  return prisma.user.upsert({
    where: {
      email: input.email
    },
    update: {
      fullName: input.fullName,
      role: input.role,
      passwordHash: input.passwordHash,
      isActive: input.isActive ?? true
    },
    create: {
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      passwordHash: input.passwordHash,
      isActive: input.isActive ?? true
    }
  });
}
