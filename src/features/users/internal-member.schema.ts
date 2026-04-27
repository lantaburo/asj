import { InstructorLevel, Role } from "@prisma/client";
import { z } from "zod";

const optionalPhone = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(8).max(30).optional());

const optionalPassword = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(8).max(100).optional());

const optionalInstructorLevel = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}, z.nativeEnum(InstructorLevel).nullable().optional());

export const internalRoles: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.INSTRUCTOR,
  Role.ASSESSOR,
  Role.CLIENT_HR,
  Role.AUDITOR
];

const adminRolesForPassword: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

export const createInternalMemberSchema = z
  .object({
    fullName: z.string().trim().min(3).max(120),
    email: z.string().trim().email(),
    phone: optionalPhone,
    role: z.nativeEnum(Role),
    instructorLevel: optionalInstructorLevel,
    password: optionalPassword,
    isActive: z.boolean().optional()
  })
  .refine((value) => internalRoles.includes(value.role), {
    path: ["role"],
    message: "Role internal tidak valid."
  })
  .refine(
    (value) =>
      value.role !== Role.INSTRUCTOR ||
      value.instructorLevel !== null && value.instructorLevel !== undefined,
    {
      path: ["instructorLevel"],
      message: "Level instruktur wajib diisi untuk role INSTRUCTOR."
    }
  )
  .refine(
    (value) =>
      value.role === Role.INSTRUCTOR ||
      value.instructorLevel === null ||
      value.instructorLevel === undefined,
    {
      path: ["instructorLevel"],
      message: "Level instruktur hanya boleh diisi untuk role INSTRUCTOR."
    }
  )
  .refine(
    (value) =>
      !adminRolesForPassword.includes(value.role) ||
      (value.password ?? "").length >= 8,
    {
      path: ["password"],
      message: "Password wajib diisi minimal 8 karakter untuk role admin."
    }
  );
