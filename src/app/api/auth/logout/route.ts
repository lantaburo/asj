import { clearAuthSessionCookie } from "@/lib/auth-session";
import { successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = successResponse(
    {
      loggedOut: true
    },
    {
      message: "Logout berhasil."
    }
  );

  clearAuthSessionCookie(response);

  return response;
}
