import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  deleteInternalMemberRecord,
  updateInternalMemberRecord
} from "@/features/users/internal-member.service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const resolvedParams = await params;
    await requireAdminSessionUser();
    const contentType = request.headers.get("content-type") || "";
    const body = contentType.includes("multipart/form-data") 
      ? await request.formData()
      : await request.json();
    const member = await updateInternalMemberRecord(resolvedParams.memberId, body);

    return successResponse(
      { member },
      { message: "Member internal berhasil diperbarui." }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const resolvedParams = await params;
    await requireAdminSessionUser();
    await deleteInternalMemberRecord(resolvedParams.memberId);

    return successResponse(
      null,
      { message: "Member internal berhasil dihapus." }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
