import { z } from "zod";

const phoneRegex = /^[0-9+\-\s]{8,20}$/;

export const participantSessionRequestSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(phoneRegex, "Nomor telepon tidak valid.").optional(),
    fullName: z.string().min(2).max(100).optional(),
    password: z.string().min(6).max(128).optional()
  })
  .refine((value) => value.email || value.phone, {
    message: "Email atau nomor telepon wajib diisi.",
    path: ["email"]
  });

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export type ParticipantSessionRequestInput = z.infer<
  typeof participantSessionRequestSchema
>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
