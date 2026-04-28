import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  getClassroomDetail,
  updateClassroomRecord,
  deleteClassroomRecord
} from "@/features/classrooms/classroom.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    classroomId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { classroomId } = await params;
    const classroom = await getClassroomDetail(classroomId);

    return successResponse(
      {
        classroom
      },
      {
        message: "Detail classroom berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { classroomId } = await params;
    const body = await request.json();
    const classroom = await updateClassroomRecord(classroomId, body);

    return successResponse(
      {
        classroom
      },
      {
        message: "Classroom berhasil diperbarui."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSessionUser();
    const { classroomId } = await params;
    await deleteClassroomRecord(classroomId);

    return successResponse(
      null,
      {
        message: "Classroom berhasil dihapus."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
