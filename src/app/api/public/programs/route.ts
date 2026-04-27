import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { getPublicPrograms } from "@/features/programs/program.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const programs = await getPublicPrograms();

    return successResponse(
      {
        programs
      },
      {
        message: "Program publik berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
