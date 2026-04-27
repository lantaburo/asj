import { Role } from "@prisma/client";

import { AppError } from "@/lib/app-error";

import { findUserById } from "@/features/users/user.repository";

export const adminRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];
export const verifierRoles: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.ASSESSOR,
  Role.INSTRUCTOR
];

export function hasRequiredRole(role: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(role);
}

export async function ensureActiveUser(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User tidak ditemukan.", {
      statusCode: 404,
      code: "USER_NOT_FOUND"
    });
  }

  if (!user.isActive) {
    throw new AppError("User tidak aktif.", {
      statusCode: 409,
      code: "USER_INACTIVE"
    });
  }

  return user;
}

export async function ensureAdminUser(userId: string) {
  const user = await ensureActiveUser(userId);

  if (!hasRequiredRole(user.role, adminRoles)) {
    throw new AppError("User ini tidak memiliki akses admin.", {
      statusCode: 403,
      code: "ADMIN_ROLE_REQUIRED"
    });
  }

  return user;
}

export async function ensureVerifierUser(userId: string) {
  const user = await ensureActiveUser(userId);

  if (!hasRequiredRole(user.role, verifierRoles)) {
    throw new AppError("User ini tidak memiliki hak verifikasi log atau assessment.", {
      statusCode: 403,
      code: "INVALID_VERIFIER_ROLE"
    });
  }

  return user;
}
