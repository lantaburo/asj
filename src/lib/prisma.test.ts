describe("prisma env guard", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const globalForPrisma = globalThis as unknown as {
    prisma?: unknown;
  };

  beforeEach(() => {
    vi.resetModules();
    process.env.DATABASE_URL = "";
    delete globalForPrisma.prisma;
  });

  afterEach(() => {
    vi.resetModules();
    delete globalForPrisma.prisma;

    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
      return;
    }

    delete process.env.DATABASE_URL;
  });

  it("throws a clear AppError when DATABASE_URL is missing", async () => {
    const { prisma } = await import("@/lib/prisma");

    expect(() => prisma.$connect()).toThrowError(
      expect.objectContaining({
        name: "AppError",
        message: "DATABASE_URL belum dikonfigurasi.",
        code: "DATABASE_URL_MISSING",
        statusCode: 500
      })
    );
  });
});
