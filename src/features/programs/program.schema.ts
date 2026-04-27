import { ProgramCategory } from "@prisma/client";
import { z } from "zod";

const optionalCustomCategory = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}, z.string().min(2).max(80).nullable().optional());

const programBaseSchema = z.object({
  title: z.string().trim().min(3).max(150),
  category: z.nativeEnum(ProgramCategory),
  customCategory: optionalCustomCategory,
  industryType: z.string().trim().min(2).max(100).default("Umum"),
  description: z.string().trim().max(5000).nullable().optional(),
  curriculum: z.unknown().optional(),
  isActive: z.boolean().optional()
});

export const createProgramSchema = programBaseSchema.refine(
  (value) =>
    value.category !== ProgramCategory.LAINNYA ||
    (value.customCategory ?? "").trim().length > 0,
  {
    path: ["customCategory"],
    message: "Custom kategori wajib diisi saat kategori LAINNYA."
  }
);

export const updateProgramSchema = programBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Minimal satu field harus diubah."
  })
  .refine(
    (value) =>
      value.category !== ProgramCategory.LAINNYA ||
      (value.customCategory ?? "").trim().length > 0,
    {
      path: ["customCategory"],
      message: "Custom kategori wajib diisi saat kategori LAINNYA."
    }
  );

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
