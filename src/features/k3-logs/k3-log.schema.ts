import { z } from "zod";

export const createK3LogSchema = z.object({
  enrollmentId: z.string().uuid(),
  activityName: z.string().min(3).max(160),
  safetyScore: z.number().int().min(0).max(100).optional(),
  evidenceUrl: z.string().url().nullable().optional(),
  gpsWatermark: z.unknown().optional()
}).strict();

export const updateK3LogSchema = z.object({
  activityName: z.string().min(3).max(160).optional(),
  safetyScore: z.number().int().min(0).max(100).optional(),
  evidenceUrl: z.string().url().nullable().optional(),
  gpsWatermark: z.unknown().optional(),
  verified: z.literal(true).optional()
}).strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Minimal satu field harus diubah."
  });
