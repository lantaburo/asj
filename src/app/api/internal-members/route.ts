import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  createInternalMemberRecord,
  getInternalMemberList
} from "@/features/users/internal-member.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSessionUser();
    const members = await getInternalMemberList();

    return successResponse(
      {
        members
      },
      {
        message: "Daftar member internal berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSessionUser();
    const contentType = request.headers.get("content-type") || "";
    const body = contentType.includes("multipart/form-data") 
      ? await request.formData()
      : await request.json();
    const member = await createInternalMemberRecord(body);

    return successResponse(
      {
        member
      },
      {
        status: 201,
        message: "Member internal berhasil dibuat."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
