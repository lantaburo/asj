import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Role } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import { hashPassword } from "@/lib/password";
import { createInternalMemberSchema, updateInternalMemberSchema } from "@/features/users/internal-member.schema";
import {
  createInternalMember,
  deleteUser,
  findUserById,
  findUserByIdentity,
  listInternalMembers,
  updateInternalMember
} from "@/features/users/user.repository";

async function writeProfilePictureFile(userId: string, file: File): Promise<string> {
  const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowedMimeTypes.has(file.type)) {
    throw new AppError("Format foto harus JPG, PNG, atau WEBP.", { statusCode: 415, code: "INVALID_PHOTO_FORMAT" });
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new AppError("Ukuran foto maksimal 2 MB.", { statusCode: 413, code: "PHOTO_TOO_LARGE" });
  }

  const safeFileName = file.name.trim().toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/-+/g, "-") || "photo.jpg";
  const documentId = randomUUID();
  const storageKey = path.posix.join("uploads", "profile-pictures", userId, `${documentId}-${safeFileName}`);
  const absolutePath = path.join(process.cwd(), "public", storageKey);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return `/${storageKey}`;
}

async function removeProfilePictureFile(fileUrl: string) {
  if (!fileUrl.startsWith("/uploads/")) return;
  const absolutePath = path.join(process.cwd(), "public", fileUrl);
  try {
    await unlink(absolutePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") console.error("Failed to delete old profile picture:", err);
  }
}

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
    licenseNumber: member.licenseNumber,
    profilePictureUrl: member.profilePictureUrl,
    isActive: member.isActive,
    createdAt: member.createdAt.toISOString()
  };
}

export async function getInternalMemberList() {
  const members = await listInternalMembers();
  return members.map(mapInternalMember);
}

export async function createInternalMemberRecord(payload: unknown) {
  let parsedPayload: any = payload;
  let file: File | null = null;

  if (payload && typeof (payload as any).get === "function") {
    const formData = payload as FormData;
    parsedPayload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      instructorLevel: formData.get("instructorLevel"),
      licenseNumber: formData.get("licenseNumber"),
      password: formData.get("password"),
      isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on"
    };
    const uploadedFile = formData.get("profilePicture");
    if (uploadedFile && typeof (uploadedFile as File).arrayBuffer === "function" && (uploadedFile as File).size > 0) {
      file = uploadedFile as File;
    }
  }

  const parsed = createInternalMemberSchema.parse(parsedPayload);
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
  const memberId = randomUUID(); // Pre-generate ID for file storage

  let profilePictureUrl: string | null = null;
  if (file) {
    profilePictureUrl = await writeProfilePictureFile(memberId, file);
  }

  const member = await createInternalMember({
    email,
    fullName: parsed.fullName.trim(),
    phone,
    role: parsed.role,
    instructorLevel:
      parsed.role === Role.INSTRUCTOR ? (parsed.instructorLevel ?? null) : null,
    licenseNumber: parsed.licenseNumber ?? null,
    profilePictureUrl,
    passwordHash,
    isActive: parsed.isActive ?? true
  });

  return mapInternalMember(member);
}

export async function updateInternalMemberRecord(id: string, payload: unknown) {
  let parsedPayload: any = payload;
  let file: File | null = null;
  let shouldRemovePhoto = false;

  if (payload && typeof (payload as any).get === "function") {
    const formData = payload as FormData;
    parsedPayload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      instructorLevel: formData.get("instructorLevel"),
      licenseNumber: formData.get("licenseNumber"),
      password: formData.get("password"),
      isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on"
    };
    shouldRemovePhoto = formData.get("removePhoto") === "true";
    const uploadedFile = formData.get("profilePicture");
    if (uploadedFile && typeof (uploadedFile as File).arrayBuffer === "function" && (uploadedFile as File).size > 0) {
      file = uploadedFile as File;
    }
  }

  const parsed = updateInternalMemberSchema.parse(parsedPayload);
  const existing = await findUserById(id);

  if (!existing) {
    throw new AppError("Member internal tidak ditemukan.", {
      statusCode: 404,
      code: "INTERNAL_MEMBER_NOT_FOUND"
    });
  }

  const email = parsed.email?.trim().toLowerCase();
  const phone = parsed.phone?.trim();

  if (email || phone) {
    const existingIdentity = await findUserByIdentity({
      email: email,
      phone: phone
    });

    if (existingIdentity && existingIdentity.id !== id) {
      if (email && existingIdentity.email === email) {
        throw new AppError("Email member internal sudah terdaftar.", {
          statusCode: 409,
          code: "INTERNAL_MEMBER_EMAIL_EXISTS"
        });
      }
      if (phone && existingIdentity.phone === phone) {
        throw new AppError("Nomor telepon member internal sudah terdaftar.", {
          statusCode: 409,
          code: "INTERNAL_MEMBER_PHONE_EXISTS"
        });
      }
    }
  }

  const passwordHash = parsed.password ? hashPassword(parsed.password) : null;

  let profilePictureUrl = existing.profilePictureUrl;

  if (shouldRemovePhoto && profilePictureUrl) {
    await removeProfilePictureFile(profilePictureUrl);
    profilePictureUrl = null;
  } else if (file) {
    if (profilePictureUrl) {
      await removeProfilePictureFile(profilePictureUrl);
    }
    profilePictureUrl = await writeProfilePictureFile(id, file);
  }

  const member = await updateInternalMember(id, {
    email: email,
    fullName: parsed.fullName?.trim(),
    phone: phone,
    role: parsed.role,
    instructorLevel:
      parsed.role === Role.INSTRUCTOR || (parsed.role === undefined && existing.role === Role.INSTRUCTOR)
        ? parsed.instructorLevel
        : null,
    licenseNumber: parsed.licenseNumber,
    profilePictureUrl: profilePictureUrl,
    passwordHash: passwordHash,
    isActive: parsed.isActive
  });

  return mapInternalMember(member);
}

export async function deleteInternalMemberRecord(id: string) {
  const existing = await findUserById(id);

  if (!existing) {
    throw new AppError("Member internal tidak ditemukan.", {
      statusCode: 404,
      code: "INTERNAL_MEMBER_NOT_FOUND"
    });
  }

  await deleteUser(id);
}
