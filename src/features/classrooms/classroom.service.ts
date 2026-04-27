import { AppError } from "@/lib/app-error";
import {
  createClassroomSchema,
  updateClassroomSchema
} from "@/features/classrooms/classroom.schema";
import {
  createClassroom,
  findClassroomById,
  listClassrooms,
  updateClassroom
} from "@/features/classrooms/classroom.repository";

function mapClassroom(classroom: Awaited<ReturnType<typeof listClassrooms>>[number]) {
  return {
    id: classroom.id,
    roomName: classroom.roomName,
    capacity: classroom.capacity,
    facilities: classroom.facilities,
    isAvailable: classroom.isAvailable,
    sessionCount: classroom._count.sessions
  };
}

export async function getClassroomList() {
  const classrooms = await listClassrooms();
  return classrooms.map(mapClassroom);
}

export async function getClassroomDetail(classroomId: string) {
  const classroom = await findClassroomById(classroomId);

  if (!classroom) {
    throw new AppError("Classroom tidak ditemukan.", {
      statusCode: 404,
      code: "CLASSROOM_NOT_FOUND"
    });
  }

  return {
    id: classroom.id,
    roomName: classroom.roomName,
    capacity: classroom.capacity,
    facilities: classroom.facilities,
    isAvailable: classroom.isAvailable,
    sessionCount: classroom._count.sessions,
    sessions: classroom.sessions.map((session) => ({
      id: session.id,
      title: session.title,
      sessionDate: session.sessionDate.toISOString(),
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString()
    }))
  };
}

export async function createClassroomRecord(payload: unknown) {
  const parsed = createClassroomSchema.parse(payload);
  const classroom = await createClassroom(parsed);
  return getClassroomDetail(classroom.id);
}

export async function updateClassroomRecord(classroomId: string, payload: unknown) {
  const parsed = updateClassroomSchema.parse(payload);
  const existing = await findClassroomById(classroomId);

  if (!existing) {
    throw new AppError("Classroom tidak ditemukan.", {
      statusCode: 404,
      code: "CLASSROOM_NOT_FOUND"
    });
  }

  await updateClassroom(classroomId, parsed);
  return getClassroomDetail(classroomId);
}
