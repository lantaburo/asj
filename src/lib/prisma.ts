import { PrismaClient } from "@prisma/client";

import { AppError } from "@/lib/app-error";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prismaClient: PrismaClient | undefined;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new AppError("DATABASE_URL belum dikonfigurasi.", {
      statusCode: 500,
      code: "DATABASE_URL_MISSING",
      details: {
        hint: "Tambahkan DATABASE_URL pada environment aplikasi atau file .env di root project."
      }
    });
  }

  return databaseUrl;
}

function createPrismaClient(databaseUrl: string) {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });
}

function getPrismaClient() {
  const databaseUrl = getDatabaseUrl();

  if (process.env.NODE_ENV === "production") {
    prismaClient ??= createPrismaClient(databaseUrl);
    return prismaClient;
  }

  globalForPrisma.prisma ??= createPrismaClient(databaseUrl);
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);

    return typeof value === "function" ? value.bind(client) : value;
  }
});
