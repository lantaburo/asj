import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import { createSchemaUnitBulkRecord } from "@/features/unit-schemas/unit-schema.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    schemaId: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { schemaId } = await params;
    const body = await request.json();
    const schema = await createSchemaUnitBulkRecord(schemaId, body);

    return successResponse(
      {
        schema
      },
      {
        status: 201,
        message: "Unit kompetensi (bulk) berhasil ditambahkan."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
