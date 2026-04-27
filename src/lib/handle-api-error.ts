import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/app-error";
import { logger } from "@/lib/logger";
import { formatZodError } from "@/lib/zod-error";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    logger.warn({
      scope: "api",
      message: "Request validation failed.",
      meta: {
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    });

    return errorResponse({
      message: "Request validation failed.",
      status: 400,
      code: "VALIDATION_ERROR",
      details: formatZodError(error)
    });
  }

  if (error instanceof AppError) {
    logger.warn({
      scope: "api",
      message: error.message,
      meta: {
        code: error.code,
        details: error.details ?? null
      }
    });

    return errorResponse({
      message: error.message,
      status: error.statusCode,
      code: error.code,
      details: error.details
    });
  }

  if (error instanceof SyntaxError) {
    logger.warn({
      scope: "api",
      message: "Request body is not valid JSON.",
      meta: { detail: error.message }
    });

    return errorResponse({
      message: "Request body harus berformat JSON yang valid.",
      status: 400,
      code: "INVALID_JSON"
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      logger.warn({
        scope: "api",
        message: "Unique constraint violation.",
        meta: {
          code: error.code,
          target: error.meta?.target ?? null
        }
      });

      return errorResponse({
        message: "Unique constraint violation.",
        status: 409,
        code: "UNIQUE_CONSTRAINT",
        details: {
          target: error.meta?.target ?? null
        }
      });
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error({
      scope: "api",
      message: "Database connection failed during Prisma initialization.",
      error
    });

    return errorResponse({
      message: "Database connection failed.",
      status: 503,
      code: "DATABASE_UNAVAILABLE"
    });
  }

  logger.error({
    scope: "api",
    message: "Unexpected server error.",
    error
  });

  return errorResponse({
    message: "Unexpected server error.",
    status: 500
  });
}
