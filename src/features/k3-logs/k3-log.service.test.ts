import {
  createK3LogRecord,
  updateK3LogRecord
} from "@/features/k3-logs/k3-log.service";
import {
  createK3Log,
  findK3LogById,
  listK3Logs,
  updateK3Log
} from "@/features/k3-logs/k3-log.repository";
import { findEnrollmentById } from "@/features/enrollments/enrollment.repository";
import { ensureVerifierUser } from "@/features/users/user.service";

vi.mock("@/features/k3-logs/k3-log.repository", () => ({
  createK3Log: vi.fn(),
  findK3LogById: vi.fn(),
  listK3Logs: vi.fn(),
  updateK3Log: vi.fn()
}));

vi.mock("@/features/enrollments/enrollment.repository", () => ({
  findEnrollmentById: vi.fn()
}));

vi.mock("@/features/users/user.service", () => ({
  ensureVerifierUser: vi.fn()
}));

const mockedCreateK3Log = vi.mocked(createK3Log);
const mockedFindK3LogById = vi.mocked(findK3LogById);
const mockedListK3Logs = vi.mocked(listK3Logs);
const mockedUpdateK3Log = vi.mocked(updateK3Log);
const mockedFindEnrollmentById = vi.mocked(findEnrollmentById);
const mockedEnsureVerifierUser = vi.mocked(ensureVerifierUser);

const ENROLLMENT_ID = "33333333-3333-4333-8333-333333333333";
const VERIFIER_ID = "44444444-4444-4444-8444-444444444444";

function buildVerifier() {
  return {
    id: VERIFIER_ID,
    email: "verifier@ajs.local",
    phone: null,
    fullName: "Verifier Demo",
    passwordHash: null,
    role: "ASSESSOR" as const,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z")
  };
}

function buildEnrollment() {
  return {
    id: ENROLLMENT_ID,
    user: {
      id: "user-1",
      fullName: "Peserta Demo",
      email: "peserta@ajs.local"
    },
    batch: {
      id: "batch-1",
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      endDate: new Date("2026-05-10T00:00:00.000Z"),
      status: "OPEN",
      program: {
        title: "Ahli K3 Umum",
        category: "KEMENAKER"
      }
    },
    k3Logs: [],
    _count: {
      k3Logs: 0
    }
  };
}

function buildLogDetail() {
  return {
    id: "log-1",
    activityName: "Praktik APD",
    safetyScore: 88,
    evidenceUrl: null,
    gpsWatermark: null,
    timestamp: new Date("2026-05-02T00:00:00.000Z"),
    enrollment: {
      id: ENROLLMENT_ID,
      qrVerifyCode: "qr-1",
      user: {
        id: "user-1",
        fullName: "Peserta Demo"
      },
      batch: {
        id: "batch-1",
        program: {
          title: "Ahli K3 Umum"
        }
      }
    },
    verifiedBy: {
      id: VERIFIER_ID,
      fullName: "Verifier Demo",
      role: "ASSESSOR"
    }
  };
}

describe("k3 log service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedListK3Logs.mockResolvedValue([]);
    mockedEnsureVerifierUser.mockResolvedValue(buildVerifier());
  });

  it("attributes created K3 logs to the verifier session user", async () => {
    mockedFindEnrollmentById.mockResolvedValueOnce(buildEnrollment());
    mockedCreateK3Log.mockResolvedValueOnce({
      id: "log-1"
    });
    mockedFindK3LogById.mockResolvedValueOnce(buildLogDetail());

    const result = await createK3LogRecord(
      {
        enrollmentId: ENROLLMENT_ID,
        activityName: "Praktik APD",
        safetyScore: 88
      },
      VERIFIER_ID
    );

    expect(mockedEnsureVerifierUser).toHaveBeenCalledWith(VERIFIER_ID);
    expect(mockedCreateK3Log).toHaveBeenCalledWith({
      enrollmentId: ENROLLMENT_ID,
      activityName: "Praktik APD",
      safetyScore: 88,
      verifiedById: VERIFIER_ID,
      evidenceUrl: null,
      gpsWatermark: undefined
    });
    expect(result.verifiedBy?.id).toBe(VERIFIER_ID);
  });

  it("uses the verifier session user when marking an existing log as verified", async () => {
    mockedFindK3LogById
      .mockResolvedValueOnce({
        id: "log-1",
        activityName: "Praktik APD",
        safetyScore: 70,
        evidenceUrl: null,
        gpsWatermark: null,
        timestamp: new Date("2026-05-02T00:00:00.000Z"),
        enrollment: {
          id: ENROLLMENT_ID,
          qrVerifyCode: "qr-1",
          user: {
            id: "user-1",
            fullName: "Peserta Demo"
          },
          batch: {
            id: "batch-1",
            program: {
              title: "Ahli K3 Umum"
            }
          }
        },
        verifiedBy: null
      })
      .mockResolvedValueOnce(buildLogDetail());

    await updateK3LogRecord(
      "log-1",
      {
        verified: true
      },
      VERIFIER_ID
    );

    expect(mockedEnsureVerifierUser).toHaveBeenCalledWith(VERIFIER_ID);
    expect(mockedUpdateK3Log).toHaveBeenCalledWith("log-1", {
      activityName: undefined,
      safetyScore: undefined,
      verifiedById: VERIFIER_ID,
      evidenceUrl: undefined,
      gpsWatermark: undefined
    });
  });
});
