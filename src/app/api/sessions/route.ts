import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  createSessionRecord,
  getSessionList
} from "@/features/sessions/session.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSessionUser();
    const sessions = await getSessionList();

    return successResponse(
      {
        sessions
      },
      {
        message: "Master data session berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSessionUser();
    const body = await request.json();
    const session = await createSessionRecord(body);

    return successResponse(
      {
        session
      },
      {
        status: 201,
        message: "Session berhasil dibuat."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
