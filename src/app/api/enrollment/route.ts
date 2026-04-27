import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { registerEnrollment } from "@/features/enrollments/enrollment.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();
    const body = await request.json();
    const result = await registerEnrollment(body, currentUser.id);

    return successResponse(result, {
      status: 201,
      message: "Enrollment berhasil dibuat."
    });
  } catch (error) {
    return handleApiError(error);
  }
}
