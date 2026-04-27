import { ProgramCategory } from "@prisma/client";
import { z } from "zod";

export const createProgramSchema = z.object({
  title: z.string().min(3).max(150),
  category: z.nativeEnum(ProgramCategory),
  industryType: z.string().min(2).max(100).default("Umum"),
  description: z.string().max(5000).nullable().optional(),
  curriculum: z.unknown().optional(),
  isActive: z.boolean().optional()
});

export const updateProgramSchema = createProgramSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "Minimal satu field harus diubah."
  }
);

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
