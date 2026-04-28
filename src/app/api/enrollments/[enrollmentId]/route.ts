import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireVerifierSessionUser } from "@/features/auth/auth.service";
import { getEnrollmentDetail, deleteEnrollmentRecord } from "@/features/enrollments/enrollment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    enrollmentId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireVerifierSessionUser();
    const { enrollmentId } = await params;
    const enrollment = await getEnrollmentDetail(enrollmentId);

    return successResponse(
      {
        enrollment
      },
      {
        message: "Detail enrollment berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireVerifierSessionUser();
    const { enrollmentId } = await params;
    await deleteEnrollmentRecord(enrollmentId);

    return successResponse(
      null,
      {
        message: "Enrollment berhasil dihapus."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
