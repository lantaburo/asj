import type { User } from "@prisma/client";
import { Role } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import { getCurrentSessionPayload } from "@/lib/auth-session";
import { env } from "@/lib/env";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  adminLoginSchema,
  participantSessionRequestSchema
} from "@/features/auth/auth.schema";
import {
  createUser,
  findUserById,
  findUserByIdentity,
  upsertInternalUserByEmail
} from "@/features/users/user.repository";
import {
  adminRoles,
  hasRequiredRole,
  verifierRoles
} from "@/features/users/user.service";

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase();
}

function normalizePhone(phone?: string) {
  return phone?.replace(/\s+/g, "");
}

function getConfiguredSuperAdminEmail() {
  return env.AJS_SUPERADMIN_EMAIL.trim().toLowerCase();
}

function buildFallbackEmail(phone?: string) {
  if (!phone) {
    return `user-${crypto.randomUUID()}@placeholder.ajs.local`;
  }

  const sanitized = phone.replace(/[^0-9]/g, "");
  return `phone-${sanitized}@placeholder.ajs.local`;
}

function buildDefaultFullName(existingUser?: User | null, fullName?: string) {
  if (existingUser?.fullName) {
    return existingUser.fullName;
  }

  return fullName?.trim() || "Peserta AJS";
}

function mapAuthenticatedUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive
  };
}

function buildParticipantSessionResult(
  user: User,
  identity: {
    email?: string;
    phone?: string;
  },
  options?: {
    tokenType?: string;
    instruction?: string;
  }
) {
  const destination = identity.email ?? identity.phone ?? user.email;
  const channel = identity.email ? "email" : "phone";

  return {
    user: mapAuthenticatedUser(user),
    auth: {
      channel,
      destination,
      tokenType: options?.tokenType ?? "mvp-auto-session",
      expiresInMinutes: 720,
      instruction:
        options?.instruction ??
        "Sesi peserta aktif otomatis di browser ini. Gunakan data yang sama untuk melanjutkan pendaftaran, absensi, atau membuka Dashboard Peserta."
    }
  };
}

async function resolveAdminLoginUser(email?: string) {
  if (!email) {
    return null;
  }

  const user = await findUserByIdentity({
    email
  });

  if (email !== getConfiguredSuperAdminEmail()) {
    return user;
  }

  if (user?.role === Role.SUPER_ADMIN && user.passwordHash && user.isActive) {
    return user;
  }

  return upsertInternalUserByEmail({
    email,
    fullName: env.AJS_SUPERADMIN_NAME.trim(),
    role: Role.SUPER_ADMIN,
    passwordHash: hashPassword(env.AJS_SUPERADMIN_PASSWORD),
    isActive: true
  });
}

export async function startParticipantSession(payload: unknown) {
  const parsed = participantSessionRequestSchema.parse(payload);
  const email = normalizeEmail(parsed.email);
  const phone = normalizePhone(parsed.phone);

  let user = await findUserByIdentity({
    email,
    phone
  });

  if (!user) {
    user = await createUser({
      email: email ?? buildFallbackEmail(phone),
      phone,
      fullName: buildDefaultFullName(null, parsed.fullName)
    });
  }

  return buildParticipantSessionResult(user, {
    email,
    phone
  });
}

export async function loginParticipant(payload: unknown) {
  const parsed = participantSessionRequestSchema.parse(payload);
  const email = normalizeEmail(parsed.email);
  const phone = normalizePhone(parsed.phone);
  const user = email
    ? await findUserByIdentity({
        email
      })
    : await findUserByIdentity({
        phone
      });

  if (!user || !user.isActive) {
    throw new AppError(
      "Data peserta tidak ditemukan atau sesi belum pernah dibuat. Gunakan email atau nomor yang dipakai saat mendaftar.",
      {
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND"
      }
    );
  }

  if (user.role !== Role.TRAINEE) {
    throw new AppError(
      "Identitas ini terhubung ke akun internal. Jika Anda staf, gunakan halaman Masuk Admin.",
      {
        statusCode: 403,
        code: "PARTICIPANT_ACCESS_DENIED"
      }
    );
  }

  return buildParticipantSessionResult(
    user,
    {
      email,
      phone
    },
    {
      tokenType: "participant-login",
      instruction:
        "Sesi peserta berhasil dipulihkan di browser ini. Lanjutkan kembali ke Dashboard Peserta untuk melihat progres pelatihan."
    }
  );
}

export async function loginAdmin(payload: unknown) {
  const parsed = adminLoginSchema.parse(payload);
  const email = normalizeEmail(parsed.email);

  const user = await resolveAdminLoginUser(email);

  if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
    throw new AppError("Email atau password admin tidak valid.", {
      statusCode: 401,
      code: "INVALID_ADMIN_CREDENTIALS"
    });
  }

  if (!user.isActive) {
    throw new AppError("User admin tidak aktif.", {
      statusCode: 409,
      code: "ADMIN_USER_INACTIVE"
    });
  }

  if (!hasRequiredRole(user.role, verifierRoles)) {
    throw new AppError("Akun ini tidak memiliki akses admin.", {
      statusCode: 403,
      code: "ADMIN_ACCESS_DENIED"
    });
  }

  return {
    user: mapAuthenticatedUser(user),
    session: {
      type: "cookie",
      scope: "admin",
      expiresInHours: 12
    }
  };
}

export async function getCurrentSessionUser() {
  const session = await getCurrentSessionPayload();

  if (!session) {
    return null;
  }

  const user = await findUserById(session.userId);

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export async function requireAuthenticatedSessionUser() {
  const user = await getCurrentSessionUser();

  if (!user) {
    throw new AppError("Sesi login tidak ditemukan atau sudah berakhir.", {
      statusCode: 401,
      code: "AUTH_REQUIRED"
    });
  }

  return user;
}

export async function requireAdminSessionUser() {
  const user = await requireAuthenticatedSessionUser();

  if (!hasRequiredRole(user.role, adminRoles)) {
    throw new AppError("Akses admin dibutuhkan untuk endpoint ini.", {
      statusCode: 403,
      code: "ADMIN_ACCESS_REQUIRED"
    });
  }

  return user;
}

export async function requireVerifierSessionUser() {
  const user = await requireAuthenticatedSessionUser();

  if (!hasRequiredRole(user.role, verifierRoles)) {
    throw new AppError("Role verifikator dibutuhkan untuk endpoint ini.", {
      statusCode: 403,
      code: "VERIFIER_ACCESS_REQUIRED"
    });
  }

  return user;
}

export function canAccessAdminPortal(role: Role) {
  return hasRequiredRole(role, verifierRoles);
}

export function canManageMasterData(role: Role) {
  return hasRequiredRole(role, adminRoles);
}

export function canManageLandingSettings(role: Role) {
  return role === Role.SUPER_ADMIN;
}
