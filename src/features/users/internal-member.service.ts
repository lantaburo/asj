import { Role } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import { hashPassword } from "@/lib/password";
import { createInternalMemberSchema } from "@/features/users/internal-member.schema";
import {
  createInternalMember,
  findUserByIdentity,
  listInternalMembers
} from "@/features/users/user.repository";

function mapInternalMember(
  member: Awaited<ReturnType<typeof listInternalMembers>>[number]
) {
  return {
    id: member.id,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone,
    role: member.role,
    instructorLevel: member.instructorLevel,
    isActive: member.isActive,
    createdAt: member.createdAt.toISOString()
  };
}

export async function getInternalMemberList() {
  const members = await listInternalMembers();
  return members.map(mapInternalMember);
}

export async function createInternalMemberRecord(payload: unknown) {
  const parsed = createInternalMemberSchema.parse(payload);
  const email = parsed.email.trim().toLowerCase();
  const phone = parsed.phone?.trim();

  const existing = await findUserByIdentity({
    email,
    phone
  });

  if (existing?.email === email) {
    throw new AppError("Email member internal sudah terdaftar.", {
      statusCode: 409,
      code: "INTERNAL_MEMBER_EMAIL_EXISTS"
    });
  }

  if (phone && existing?.phone === phone) {
    throw new AppError("Nomor telepon member internal sudah terdaftar.", {
      statusCode: 409,
      code: "INTERNAL_MEMBER_PHONE_EXISTS"
    });
  }

  const passwordHash = parsed.password ? hashPassword(parsed.password) : null;

  const member = await createInternalMember({
    email,
    fullName: parsed.fullName.trim(),
    phone,
    role: parsed.role,
    instructorLevel:
      parsed.role === Role.INSTRUCTOR ? (parsed.instructorLevel ?? null) : null,
    passwordHash,
    isActive: parsed.isActive ?? true
  });

  return mapInternalMember(member);
}
