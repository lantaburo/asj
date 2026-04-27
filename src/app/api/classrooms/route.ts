import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { requireAdminSessionUser } from "@/features/auth/auth.service";
import {
  createClassroomRecord,
  getClassroomList
} from "@/features/classrooms/classroom.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSessionUser();
    const classrooms = await getClassroomList();

    return successResponse(
      {
        classrooms
      },
      {
        message: "Master data classroom berhasil diambil."
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
    const classroom = await createClassroomRecord(body);

    return successResponse(
      {
        classroom
      },
      {
        status: 201,
        message: "Classroom berhasil dibuat."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
