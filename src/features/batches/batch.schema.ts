import { BatchStatus } from "@prisma/client";
import { z } from "zod";

const optionalUuid = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}, z.string().uuid().nullable().optional());

const optionalPrice = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}, z.coerce.number().int().nonnegative().nullable().optional());

const batchBaseSchema = z.object({
  title: z.string().nullable().optional(),
  programId: z.string().uuid(),
  instructorId: optionalUuid,
  assessorId: optionalUuid,
  classroomId: optionalUuid,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  quota: z.coerce.number().int().positive(),
  price: optionalPrice,
  pricePackages: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(BatchStatus).optional()
});

export const createBatchSchema = batchBaseSchema.refine(
  (value) => value.endDate > value.startDate,
  {
    message: "Tanggal akhir batch harus setelah tanggal mulai.",
    path: ["endDate"]
  }
);

export const updateBatchSchema = batchBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "Minimal satu field harus diubah."
  }
);

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
