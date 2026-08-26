import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import { handleApiError } from "@/lib/handle-api-error";
import { AppError } from "@/lib/app-error";
import { successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      throw new AppError("File tidak ditemukan.", { statusCode: 400 });
    }
    if (file.size > MAX_BYTES) {
      throw new AppError("Ukuran file melebihi batas 10 MB.", { statusCode: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = (file as File).name?.split(".").pop() || "jpg";
    const filename = `payment-${currentUser.id}-${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const fileUrl = `/uploads/payment-proofs/${filename}`;

    return successResponse({ url: fileUrl }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
