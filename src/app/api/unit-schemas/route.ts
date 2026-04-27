import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  createUnitSchemaRecord,
  getUnitSchemaList
} from "@/features/unit-schemas/unit-schema.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSessionUser();
    const schemas = await getUnitSchemaList();

    return successResponse(
      {
        schemas
      },
      {
        message: "Daftar unit skema berhasil diambil."
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
    const schema = await createUnitSchemaRecord(body);

    return successResponse(
      {
        schema
      },
      {
        status: 201,
        message: "Unit skema berhasil dibuat."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
