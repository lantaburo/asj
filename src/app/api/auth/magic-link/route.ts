import { setAuthSessionCookie } from "@/lib/auth-session";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { startParticipantSession } from "@/features/auth/auth.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await startParticipantSession(body);
    const response = successResponse(result, {
      status: 200,
      message: "Sesi peserta berhasil diaktifkan."
    });

    setAuthSessionCookie(response, result.user.id);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
