import { NextResponse } from "next/server";

type SuccessOptions = {
  message?: string;
  status?: number;
};

type ErrorOptions = {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
};

export function successResponse<T>(data: T, options?: SuccessOptions) {
  return NextResponse.json(
    {
      success: true,
      message: options?.message ?? null,
      data
    },
    {
      status: options?.status ?? 200
    }
  );
}

export function errorResponse(options: ErrorOptions) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: options.message,
        code: options.code ?? "INTERNAL_SERVER_ERROR",
        details: options.details ?? null
      }
    },
    {
      status: options.status
    }
  );
}
