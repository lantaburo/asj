import { prisma } from "@/lib/prisma";

export async function checkDatabaseConnection() {
  const startedAt = Date.now();

  await prisma.$queryRaw`SELECT 1`;

  return {
    database: "up",
    latencyMs: Date.now() - startedAt
  };
}

export function getLivenessSnapshot() {
  return {
    service: "ajs-k3-system",
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version
  };
}
