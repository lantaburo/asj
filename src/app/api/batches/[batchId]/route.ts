import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  getAdminBatchById,
  updateBatchRecord
} from "@/features/batches/batch.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    batchId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { batchId } = await params;
    const batch = await getAdminBatchById(batchId);

    return successResponse(
      {
        batch
      },
      {
        message: "Detail batch berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { batchId } = await params;
    const body = await request.json();
    const batch = await updateBatchRecord(batchId, body);

    return successResponse(
      {
        batch
      },
      {
        message: "Batch berhasil diperbarui."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
