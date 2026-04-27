import { handleApiError } from "@/lib/handle-api-error";
import { setAuthSessionCookie } from "@/lib/auth-session";
import { successResponse } from "@/lib/api-response";
import { loginAdmin } from "@/features/auth/auth.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginAdmin(body);
    const response = successResponse(result, {
      message: "Login admin berhasil."
    });

    setAuthSessionCookie(response, result.user.id);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
