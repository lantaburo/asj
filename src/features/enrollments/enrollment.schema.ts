import { z } from "zod";

export const enrollmentCreateSchema = z.object({
  batchId: z.string().uuid(),
  registrationDocs: z.record(z.string(), z.string()).optional()
}).strict();

export type EnrollmentCreateInput = z.infer<typeof enrollmentCreateSchema>;
