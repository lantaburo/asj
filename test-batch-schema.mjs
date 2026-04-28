import { z } from "zod";

const BatchStatus = {
  OPEN: "OPEN",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED"
};

const optionalUuid = z.preprocess((value) => {
  if (value === undefined || value === null) return value;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}, z.string().uuid().nullable().optional());

const optionalPrice = z.preprocess((value) => {
  if (value === undefined || value === null) return value;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}, z.coerce.number().int().nonnegative().nullable().optional());

const batchBaseSchema = z.object({
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

const createBatchSchema = batchBaseSchema.refine(
  (value) => value.endDate > value.startDate,
  {
    message: "Tanggal akhir batch harus setelah tanggal mulai.",
    path: ["endDate"]
  }
);

console.dir(createBatchSchema.safeParse({
  programId: "d30c1fe3-f267-4cbd-9299-d59d6599398e",
  classroomId: "",
  startDate: "2026-04-28T12:00",
  endDate: "2026-04-29T12:00",
  quota: "10",
  price: ""
}), { depth: null });
