import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireVerifierSessionUser } from "@/features/auth/auth.service";
import {
  getK3LogDetail,
  updateK3LogRecord
} from "@/features/k3-logs/k3-log.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    logId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireVerifierSessionUser();
    const { logId } = await params;
    const log = await getK3LogDetail(logId);

    return successResponse(
      {
        log
      },
      {
        message: "Detail K3 log berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const currentUser = await requireVerifierSessionUser();
    const { logId } = await params;
    const body = await request.json();
    const log = await updateK3LogRecord(logId, body, currentUser.id);

    return successResponse(
      {
        log
      },
      {
        message: "K3 log berhasil diperbarui."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
