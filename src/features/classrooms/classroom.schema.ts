import { z } from "zod";

export const createClassroomSchema = z.object({
  roomName: z.string().trim().min(2).max(120),
  capacity: z.coerce.number().int().positive(),
  facilities: z.unknown().optional(),
  isAvailable: z.boolean().optional()
});

export const updateClassroomSchema = createClassroomSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "Minimal satu field harus diubah."
  }
);
