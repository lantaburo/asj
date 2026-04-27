import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireVerifierSessionUser } from "@/features/auth/auth.service";
import {
  createK3LogRecord,
  getK3LogList
} from "@/features/k3-logs/k3-log.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireVerifierSessionUser();
    const logs = await getK3LogList();

    return successResponse(
      {
        logs
      },
      {
        message: "K3 log berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireVerifierSessionUser();
    const body = await request.json();
    const log = await createK3LogRecord(body, currentUser.id);

    return successResponse(
      {
        log
      },
      {
        status: 201,
        message: "K3 log berhasil dibuat."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
