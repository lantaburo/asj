import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SESSION_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_NAME: z.string().default("AJS Learning Hub"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  AJS_SUPERADMIN_EMAIL: z.string().email().default("superadmin@ajs.local"),
  AJS_SUPERADMIN_NAME: z.string().min(3).default("Super Admin AJS"),
  AJS_SUPERADMIN_PASSWORD: z.string().min(8)
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SESSION_SECRET:
    process.env.AUTH_SESSION_SECRET ?? "ajs-local-dev-session-secret-change-me-2026",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  AJS_SUPERADMIN_EMAIL: process.env.AJS_SUPERADMIN_EMAIL,
  AJS_SUPERADMIN_NAME: process.env.AJS_SUPERADMIN_NAME,
  AJS_SUPERADMIN_PASSWORD: process.env.AJS_SUPERADMIN_PASSWORD ?? "Superadmin123!"
});
