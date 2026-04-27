import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireVerifierSessionUser } from "@/features/auth/auth.service";
import { updateEnrollmentAssessmentRecord } from "@/features/enrollments/enrollment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    enrollmentId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const currentUser = await requireVerifierSessionUser();
    const { enrollmentId } = await params;
    const body = await request.json();
    const enrollment = await updateEnrollmentAssessmentRecord(
      enrollmentId,
      {
        ...body,
        verifiedById: currentUser.id
      }
    );

    return successResponse(
      {
        enrollment
      },
      {
        message: "Assessment enrollment berhasil diperbarui."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
