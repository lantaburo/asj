import { Role } from "@prisma/client";

import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import {
  getParticipantDocuments,
  uploadParticipantDocument
} from "@/features/participant-documents/participant-document.service";
import { successResponse } from "@/lib/api-response";
import { AppError } from "@/lib/app-error";
import { handleApiError } from "@/lib/handle-api-error";

export const dynamic = "force-dynamic";

function ensureParticipantRole(role: Role) {
  if (role !== Role.TRAINEE) {
    throw new AppError("Akses dokumen peserta hanya tersedia untuk akun peserta.", {
      statusCode: 403,
      code: "PARTICIPANT_DOCUMENTS_FORBIDDEN"
    });
  }
}

export async function GET() {
  try {
    const currentUser = await requireAuthenticatedSessionUser();
    ensureParticipantRole(currentUser.role);
    const documents = await getParticipantDocuments(currentUser.id);

    return successResponse(
      {
        documents
      },
      {
        message: "Dokumen peserta berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();
    ensureParticipantRole(currentUser.role);
    const formData = await request.formData();
    const result = await uploadParticipantDocument(formData, currentUser.id);

    return successResponse(result, {
      status: 201,
      message: "Dokumen peserta berhasil diunggah."
    });
  } catch (error) {
    return handleApiError(error);
  }
}
