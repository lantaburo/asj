import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { revalidatePath } from "next/cache";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  getUnitSchemaDetail,
  updateUnitSchemaRecord,
  deleteUnitSchemaRecord
} from "@/features/unit-schemas/unit-schema.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    schemaId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { schemaId } = await params;
    const schema = await getUnitSchemaDetail(schemaId);

    return successResponse(
      {
        schema
      },
      {
        message: "Detail unit skema berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { schemaId } = await params;
    const body = await request.json();
    const schema = await updateUnitSchemaRecord(schemaId, body);

    revalidatePath("/admin/unit-skema");
    revalidatePath("/admin/master-data");

    return successResponse(
      {
        schema
      },
      {
        message: "Unit skema berhasil diperbarui."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { schemaId } = await params;
    await deleteUnitSchemaRecord(schemaId);

    revalidatePath("/admin/unit-skema");
    revalidatePath("/admin/master-data");

    return successResponse(
      null,
      {
        message: "Unit skema berhasil dihapus."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
