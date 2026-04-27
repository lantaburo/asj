import { Role } from "@prisma/client";

import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import { deleteParticipantDocument } from "@/features/participant-documents/participant-document.service";
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

type ParticipantDocumentRouteProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: ParticipantDocumentRouteProps
) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();
    ensureParticipantRole(currentUser.role);
    const { documentId } = await params;
    const result = await deleteParticipantDocument(documentId, currentUser.id);

    return successResponse(result, {
      message: "Dokumen peserta berhasil dihapus."
    });
  } catch (error) {
    return handleApiError(error);
  }
}
