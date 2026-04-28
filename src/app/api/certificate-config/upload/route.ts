import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getCurrentSessionUser, canManageMasterData } from "@/features/auth/auth.service";
import { AppError } from "@/lib/app-error";
import { handleApiError } from "@/lib/handle-api-error";

export const dynamic = "force-dynamic";

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "file";
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentSessionUser();
    if (!user || !canManageMasterData(user.role)) {
      throw new AppError("Akses ditolak.", { statusCode: 403, code: "FORBIDDEN" });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError("File wajib diunggah.", { statusCode: 400, code: "FILE_REQUIRED" });
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new AppError("Ukuran file maksimal 8 MB.", { statusCode: 413, code: "FILE_TOO_LARGE" });
    }

    const fileId = randomUUID();
    const safeFileName = sanitizeFileName(file.name);
    const storageKey = path.posix.join("uploads", "certificates", `${fileId}-${safeFileName}`);
    const absolutePath = path.join(process.cwd(), "public", storageKey);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, buffer);

    const fileUrl = `/${storageKey}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
