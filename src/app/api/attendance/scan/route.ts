import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { scanAttendance } from "@/features/attendance/attendance.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();
    const body = await request.json();
    const result = await scanAttendance(body, currentUser.id);

    return successResponse(result, {
      status: 201,
      message: "Attendance berhasil direkam."
    });
  } catch (error) {
    return handleApiError(error);
  }
}
