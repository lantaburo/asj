import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  createProgramRecord,
  getAdminPrograms
} from "@/features/programs/program.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSessionUser();
    const programs = await getAdminPrograms();

    return successResponse(
      {
        programs
      },
      {
        message: "Master data program berhasil diambil."
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
    const program = await createProgramRecord(body);

    return successResponse(
      {
        program
      },
      {
        status: 201,
        message: "Program berhasil dibuat."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
