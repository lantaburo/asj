import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { AppError } from "@/lib/app-error";
import { scanAttendanceWithPhoto } from "@/features/attendance/attendance.service";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();

    const formData = await request.formData();
    const sessionId = formData.get("sessionId");
    const photo = formData.get("photo");

    if (!sessionId || typeof sessionId !== "string") {
      throw new AppError("Session ID tidak valid.", { statusCode: 400, code: "INVALID_SESSION_ID" });
    }
    if (!photo || !(photo instanceof Blob)) {
      throw new AppError("Foto tidak ditemukan dalam request.", { statusCode: 400, code: "PHOTO_REQUIRED" });
    }
    if (photo.size > MAX_BYTES) {
      throw new AppError("Ukuran foto melebihi batas 5 MB.", { statusCode: 400, code: "PHOTO_TOO_LARGE" });
    }

    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `selfie-${currentUser.id}-${randomUUID()}.jpg`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "selfies");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    const selfieUrl = `/uploads/selfies/${filename}`;

    const result = await scanAttendanceWithPhoto({ sessionId, selfieUrl }, currentUser.id);

    return successResponse(result, { status: 201, message: "Kehadiran berhasil direkam." });
  } catch (error) {
    return handleApiError(error);
  }
}
