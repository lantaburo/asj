import { successResponse } from "@/lib/api-response";
import { getLivenessSnapshot } from "@/lib/health";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getLivenessSnapshot();

  logger.info({
    scope: "health",
    message: "Liveness probe requested.",
    meta: snapshot
  });

  return successResponse(snapshot, {
    message: "Service is live."
  });
}
