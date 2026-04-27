import type { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return {
    formErrors: error.flatten().formErrors,
    fieldErrors: error.flatten().fieldErrors
  };
}
