import { Prisma } from "@prisma/client";

import {
  createAttendance,
  findSessionById
} from "@/features/attendance/attendance.repository";
import { scanAttendance } from "@/features/attendance/attendance.service";
import { findEnrollmentByBatchAndUser } from "@/features/enrollments/enrollment.repository";
import { ensureActiveUser } from "@/features/users/user.service";

vi.mock("@/features/attendance/attendance.repository", () => ({
  createAttendance: vi.fn(),
  findSessionById: vi.fn()
}));

vi.mock("@/features/enrollments/enrollment.repository", () => ({
  findEnrollmentByBatchAndUser: vi.fn()
}));

vi.mock("@/features/users/user.service", () => ({
  ensureActiveUser: vi.fn()
}));

const mockedCreateAttendance = vi.mocked(createAttendance);
const mockedFindSessionById = vi.mocked(findSessionById);
const mockedFindEnrollmentByBatchAndUser = vi.mocked(findEnrollmentByBatchAndUser);
const mockedEnsureActiveUser = vi.mocked(ensureActiveUser);

const SESSION_ID = "22222222-2222-4222-8222-222222222222";

function buildUser() {
  return {
    id: "user-1",
    email: "peserta@ajs.local",
    phone: null,
    fullName: "Peserta Demo",
    passwordHash: null,
    role: "TRAINEE" as const,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z")
  };
}

describe("attendance service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records attendance for the authenticated session user", async () => {
    mockedFindSessionById.mockResolvedValueOnce({
      id: SESSION_ID,
      batch: {
        id: "batch-1",
        program: {
          title: "Ahli K3 Umum"
        }
      }
    });
    mockedEnsureActiveUser.mockResolvedValueOnce(buildUser());
    mockedFindEnrollmentByBatchAndUser.mockResolvedValueOnce({
      id: "enrollment-1"
    });
    mockedCreateAttendance.mockResolvedValueOnce({
      id: "attendance-1",
      session: {
        id: SESSION_ID,
        title: "Sesi 1",
        sessionDate: new Date("2026-05-01T00:00:00.000Z")
      },
      user: {
        id: "user-1",
        fullName: "Peserta Demo"
      }
    });

    const result = await scanAttendance(
      {
        sessionId: SESSION_ID,
        gpsCoordinates: {
          lat: -6.2,
          lng: 106.8
        },
        status: "PRESENT",
        deviceInfo: "Mozilla/5.0"
      },
      "user-1"
    );

    expect(mockedEnsureActiveUser).toHaveBeenCalledWith("user-1");
    expect(mockedFindEnrollmentByBatchAndUser).toHaveBeenCalledWith("batch-1", "user-1");
    expect(mockedCreateAttendance).toHaveBeenCalledWith({
      sessionId: SESSION_ID,
      userId: "user-1",
      gpsCoordinates: {
        lat: -6.2,
        lng: 106.8
      },
      selfieUrl: undefined,
      deviceInfo: "Mozilla/5.0",
      status: "PRESENT"
    });
    expect(result.attendance.id).toBe("attendance-1");
  });

  it("maps duplicate attendance inserts to a domain error", async () => {
    mockedFindSessionById.mockResolvedValueOnce({
      id: SESSION_ID,
      batch: {
        id: "batch-1",
        program: {
          title: "Ahli K3 Umum"
        }
      }
    });
    mockedEnsureActiveUser.mockResolvedValueOnce(buildUser());
    mockedFindEnrollmentByBatchAndUser.mockResolvedValueOnce({
      id: "enrollment-1"
    });
    mockedCreateAttendance.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("duplicate attendance", {
        code: "P2002",
        clientVersion: "test",
        meta: {
          target: ["sessionId", "userId"]
        }
      })
    );

    await expect(
      scanAttendance(
        {
          sessionId: SESSION_ID,
          gpsCoordinates: {
            lat: -6.2,
            lng: 106.8
          }
        },
        "user-1"
      )
    ).rejects.toMatchObject({
      code: "DUPLICATE_ATTENDANCE",
      statusCode: 409
    });
  });
});
