import { PrismaClient, Role } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} wajib diisi.`);
  }

  return value;
}

async function main() {
  const email = requiredEnv("AJS_SUPERADMIN_EMAIL").toLowerCase();
  const fullName = requiredEnv("AJS_SUPERADMIN_NAME");
  const password = requiredEnv("AJS_SUPERADMIN_PASSWORD");

  const user = await prisma.user.upsert({
    where: {
      email
    },
    update: {
      fullName,
      role: Role.SUPER_ADMIN,
      passwordHash: hashPassword(password),
      isActive: true
    },
    create: {
      email,
      fullName,
      role: Role.SUPER_ADMIN,
      passwordHash: hashPassword(password),
      isActive: true
    }
  });

  console.log(
    JSON.stringify(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
