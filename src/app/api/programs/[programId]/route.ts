import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  getAdminProgramById,
  updateProgramRecord
} from "@/features/programs/program.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    programId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { programId } = await params;
    const program = await getAdminProgramById(programId);

    return successResponse(
      {
        program
      },
      {
        message: "Detail program berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { programId } = await params;
    const body = await request.json();
    const program = await updateProgramRecord(programId, body);

    return successResponse(
      {
        program
      },
      {
        message: "Program berhasil diperbarui."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
