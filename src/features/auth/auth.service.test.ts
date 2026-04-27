import type { User } from "@prisma/client";

import { hashPassword } from "@/lib/password";
import {
  loginAdmin,
  startParticipantSession
} from "@/features/auth/auth.service";
import {
  createUser,
  findUserById,
  findUserByIdentity,
  upsertInternalUserByEmail
} from "@/features/users/user.repository";

vi.mock("@/features/users/user.repository", () => ({
  createUser: vi.fn(),
  findUserById: vi.fn(),
  findUserByIdentity: vi.fn(),
  upsertInternalUserByEmail: vi.fn()
}));

const mockedFindUserByIdentity = vi.mocked(findUserByIdentity);
const mockedCreateUser = vi.mocked(createUser);
const mockedFindUserById = vi.mocked(findUserById);
const mockedUpsertInternalUserByEmail = vi.mocked(upsertInternalUserByEmail);

function buildUser(overrides?: Partial<User>): User {
  return {
    id: "user-1",
    email: "peserta@ajs.local",
    phone: null,
    fullName: "Peserta Demo",
    role: "TRAINEE",
    passwordHash: null,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  };
}

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFindUserById.mockResolvedValue(null);
  });

  it("returns session info for an existing email user", async () => {
    mockedFindUserByIdentity.mockResolvedValueOnce(
      buildUser({
        email: "existing@ajs.local"
      })
    );

    const result = await startParticipantSession({
      email: "Existing@AJS.local"
    });

    expect(mockedFindUserByIdentity).toHaveBeenCalledWith({
      email: "existing@ajs.local",
      phone: undefined
    });
    expect(result.auth.channel).toBe("email");
    expect(result.user.email).toBe("existing@ajs.local");
  });

  it("creates a phone-based user with placeholder email when user does not exist", async () => {
    mockedFindUserByIdentity.mockResolvedValueOnce(null);
    mockedCreateUser.mockResolvedValueOnce(
      buildUser({
        email: "phone-628111222333@placeholder.ajs.local",
        phone: "+628111222333",
        fullName: "Peserta Baru"
      })
    );

    const result = await startParticipantSession({
      phone: "+628111222333",
      fullName: "Peserta Baru"
    });

    expect(mockedCreateUser).toHaveBeenCalledWith({
      email: "phone-628111222333@placeholder.ajs.local",
      phone: "+628111222333",
      fullName: "Peserta Baru"
    });
    expect(result.auth.channel).toBe("phone");
    expect(result.auth.destination).toBe("+628111222333");
  });

  it("allows admin login with valid credentials", async () => {
    mockedFindUserByIdentity.mockResolvedValueOnce(
      buildUser({
        email: "superadmin@ajs.local",
        role: "SUPER_ADMIN",
        passwordHash: hashPassword("Superadmin123!")
      })
    );

    const result = await loginAdmin({
      email: "superadmin@ajs.local",
      password: "Superadmin123!"
    });

    expect(result.user.email).toBe("superadmin@ajs.local");
    expect(result.user.role).toBe("SUPER_ADMIN");
    expect(result.session.scope).toBe("admin");
  });

  it("bootstraps the configured superadmin when the account is missing", async () => {
    mockedFindUserByIdentity.mockResolvedValueOnce(null);
    mockedUpsertInternalUserByEmail.mockResolvedValueOnce(
      buildUser({
        email: "superadmin@ajs.local",
        fullName: "Super Admin AJS",
        role: "SUPER_ADMIN",
        passwordHash: hashPassword("Superadmin123!")
      })
    );

    const result = await loginAdmin({
      email: "superadmin@ajs.local",
      password: "Superadmin123!"
    });

    expect(mockedUpsertInternalUserByEmail).toHaveBeenCalledWith({
      email: "superadmin@ajs.local",
      fullName: "Super Admin AJS",
      role: "SUPER_ADMIN",
      passwordHash: expect.any(String),
      isActive: true
    });
    expect(result.user.email).toBe("superadmin@ajs.local");
    expect(result.user.role).toBe("SUPER_ADMIN");
  });

  it("rejects login for a non-admin role", async () => {
    mockedFindUserByIdentity.mockResolvedValueOnce(
      buildUser({
        email: "peserta@ajs.local",
        role: "TRAINEE",
        passwordHash: hashPassword("Peserta123!")
      })
    );

    await expect(
      loginAdmin({
        email: "peserta@ajs.local",
        password: "Peserta123!"
      })
    ).rejects.toMatchObject({
      code: "ADMIN_ACCESS_DENIED",
      statusCode: 403
    });
  });
});
