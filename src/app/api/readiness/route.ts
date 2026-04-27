import { NextResponse } from "next/server";

import { checkDatabaseConnection, getLivenessSnapshot } from "@/lib/health";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const live = getLivenessSnapshot();

  try {
    const database = await checkDatabaseConnection();

    logger.info({
      scope: "readiness",
      message: "Readiness probe passed.",
      meta: {
        ...live,
        database
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...live,
          database
        }
      },
      {
        status: 200
      }
    );
  } catch (error) {
    logger.error({
      scope: "readiness",
      message: "Readiness probe failed.",
      error
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Database readiness check failed."
        },
        data: live
      },
      {
        status: 503
      }
    );
  }
}
