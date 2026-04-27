import { z } from "zod";

const optionalUuid = z.string().uuid().nullable().optional();

const sessionBaseSchema = z.object({
  batchId: z.string().uuid(),
  classroomId: optionalUuid,
  instructorId: optionalUuid,
  title: z.string().min(3).max(160),
  sessionDate: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  locationType: z.string().min(3).max(60).optional()
});

export const createSessionSchema = sessionBaseSchema.refine(
  (value) => value.endTime > value.startTime,
  {
    message: "Waktu selesai harus setelah waktu mulai.",
    path: ["endTime"]
  }
);

export const updateSessionSchema = sessionBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "Minimal satu field harus diubah."
  }
);
