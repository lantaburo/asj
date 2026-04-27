import { z } from "zod";

const phoneRegex = /^[0-9+\-\s]{8,20}$/;

export const magicLinkRequestSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(phoneRegex, "Nomor telepon tidak valid.").optional(),
    fullName: z.string().min(2).max(100).optional()
  })
  .refine((value) => value.email || value.phone, {
    message: "Email atau phone wajib diisi.",
    path: ["email"]
  });

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export type MagicLinkRequestInput = z.infer<typeof magicLinkRequestSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
