import { BatchStatus } from "@prisma/client";
import { z } from "zod";

const optionalUuid = z.string().uuid().nullable().optional();

const batchBaseSchema = z.object({
  programId: z.string().uuid(),
  instructorId: optionalUuid,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  quota: z.number().int().positive(),
  price: z.number().int().nonnegative().nullable().optional(),
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
