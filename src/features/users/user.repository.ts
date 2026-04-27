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
  const conditions = [params.email, params.phone]
    .filter(Boolean)
    .map((value) => ({
      OR: [{ email: value as string }, { phone: value as string }]
    }));

  if (conditions.length === 0) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      OR: conditions.flatMap((condition) => condition.OR)
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
