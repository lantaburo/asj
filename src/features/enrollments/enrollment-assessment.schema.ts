import { AssessmentStatus } from "@prisma/client";
import { z } from "zod";

export const enrollmentAssessmentUpdateSchema = z.object({
  assessmentStatus: z.nativeEnum(AssessmentStatus),
  certificateNum: z.string().min(4).max(100).nullable().optional(),
  expiryDate: z.coerce.date().nullable().optional(),
  verifiedById: z.string().uuid()
});
