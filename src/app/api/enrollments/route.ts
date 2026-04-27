import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireVerifierSessionUser } from "@/features/auth/auth.service";
import { getAdminEnrollments } from "@/features/enrollments/enrollment.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireVerifierSessionUser();
    const enrollments = await getAdminEnrollments();

    return successResponse(
      {
        enrollments
      },
      {
        message: "Daftar enrollment berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
