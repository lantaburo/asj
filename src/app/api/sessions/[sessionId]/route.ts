import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  getSessionDetail,
  updateSessionRecord
} from "@/features/sessions/session.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { sessionId } = await params;
    const session = await getSessionDetail(sessionId);

    return successResponse(
      {
        session
      },
      {
        message: "Detail session berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { sessionId } = await params;
    const body = await request.json();
    const session = await updateSessionRecord(sessionId, body);

    return successResponse(
      {
        session
      },
      {
        message: "Session berhasil diperbarui."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
