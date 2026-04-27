import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  createBatchRecord,
  getAdminBatches
} from "@/features/batches/batch.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSessionUser();
    const batches = await getAdminBatches();

    return successResponse(
      {
        batches
      },
      {
        message: "Master data batch berhasil diambil."
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
    const batch = await createBatchRecord(body);

    return successResponse(
      {
        batch
      },
      {
        status: 201,
        message: "Batch berhasil dibuat."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
