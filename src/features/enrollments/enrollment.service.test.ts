import { Prisma } from "@prisma/client";

import { syncBatchStatuses } from "@/features/batches/batch.repository";
import { registerEnrollment } from "@/features/enrollments/enrollment.service";
import {
  createEnrollmentInOpenBatch,
  findEnrollmentById,
  findEnrollmentByQrCode,
  listEnrollmentsAdmin,
  updateEnrollmentAssessment
} from "@/features/enrollments/enrollment.repository";
import {
  ensureActiveUser,
  ensureVerifierUser
} from "@/features/users/user.service";

vi.mock("@/features/batches/batch.repository", () => ({
  syncBatchStatuses: vi.fn()
}));

vi.mock("@/features/enrollments/enrollment.repository", () => ({
  createEnrollmentInOpenBatch: vi.fn(),
  findEnrollmentById: vi.fn(),
  findEnrollmentByQrCode: vi.fn(),
  listEnrollmentsAdmin: vi.fn(),
  updateEnrollmentAssessment: vi.fn()
}));

vi.mock("@/features/users/user.service", () => ({
  ensureActiveUser: vi.fn(),
  ensureVerifierUser: vi.fn()
}));

const mockedSyncBatchStatuses = vi.mocked(syncBatchStatuses);
const mockedCreateEnrollmentInOpenBatch = vi.mocked(createEnrollmentInOpenBatch);
const mockedFindEnrollmentById = vi.mocked(findEnrollmentById);
const mockedFindEnrollmentByQrCode = vi.mocked(findEnrollmentByQrCode);
const mockedListEnrollmentsAdmin = vi.mocked(listEnrollmentsAdmin);
const mockedUpdateEnrollmentAssessment = vi.mocked(updateEnrollmentAssessment);
const mockedEnsureActiveUser = vi.mocked(ensureActiveUser);
const mockedEnsureVerifierUser = vi.mocked(ensureVerifierUser);

const BATCH_ID = "11111111-1111-4111-8111-111111111111";

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

describe("enrollment service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFindEnrollmentById.mockResolvedValue(null);
    mockedFindEnrollmentByQrCode.mockResolvedValue(null);
    mockedListEnrollmentsAdmin.mockResolvedValue([]);
    mockedUpdateEnrollmentAssessment.mockResolvedValue(null);
    mockedEnsureVerifierUser.mockResolvedValue(buildUser());
  });

  it("registers the authenticated session user into an open batch", async () => {
    mockedEnsureActiveUser.mockResolvedValueOnce(buildUser());
    mockedCreateEnrollmentInOpenBatch.mockResolvedValueOnce({
      status: "created",
      enrollment: {
        id: "enrollment-1",
        batch: {
          id: BATCH_ID,
          status: "OPEN",
          program: {
            title: "Ahli K3 Umum"
          }
        },
        user: {
          id: "user-1",
          fullName: "Peserta Demo",
          email: "peserta@ajs.local"
        }
      },
      quota: {
        total: 20,
        remainingAfterRegistration: 19
      }
    });

    const result = await registerEnrollment(
      {
        batchId: BATCH_ID,
        registrationDocs: {
          status: "pending"
        }
      },
      "user-1"
    );

    expect(mockedSyncBatchStatuses).toHaveBeenCalledTimes(1);
    expect(mockedEnsureActiveUser).toHaveBeenCalledWith("user-1");
    expect(mockedCreateEnrollmentInOpenBatch).toHaveBeenCalledWith({
      batchId: BATCH_ID,
      userId: "user-1",
      registrationDocs: {
        status: "pending"
      }
    });
    expect(result.quota.remainingAfterRegistration).toBe(19);
    expect(result.enrollment.user.id).toBe("user-1");
  });

  it("rejects registration when the batch quota is already full", async () => {
    mockedEnsureActiveUser.mockResolvedValueOnce(buildUser());
    mockedCreateEnrollmentInOpenBatch.mockResolvedValueOnce({
      status: "batch_full"
    });

    await expect(
      registerEnrollment(
        {
          batchId: BATCH_ID
        },
        "user-1"
      )
    ).rejects.toMatchObject({
      code: "BATCH_FULL",
      statusCode: 409
    });
  });

  it("maps enrollment unique constraint errors to duplicate enrollment responses", async () => {
    mockedEnsureActiveUser.mockResolvedValueOnce(buildUser());
    mockedCreateEnrollmentInOpenBatch.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("duplicate enrollment", {
        code: "P2002",
        clientVersion: "test",
        meta: {
          target: ["batchId", "userId"]
        }
      })
    );

    await expect(
      registerEnrollment(
        {
          batchId: BATCH_ID
        },
        "user-1"
      )
    ).rejects.toMatchObject({
      code: "DUPLICATE_ENROLLMENT",
      statusCode: 409
    });
  });
});
