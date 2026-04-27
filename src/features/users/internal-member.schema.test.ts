import { describe, expect, it } from "vitest";

import { createInternalMemberSchema } from "@/features/users/internal-member.schema";

describe("createInternalMemberSchema", () => {
  it("accepts instructor payload with required instructor level", () => {
    const parsed = createInternalMemberSchema.parse({
      fullName: "Instruktur Internal",
      email: "instruktur.internal@ajs.local",
      role: "INSTRUCTOR",
      instructorLevel: "SENIOR",
      isActive: true
    });

    expect(parsed.role).toBe("INSTRUCTOR");
    expect(parsed.instructorLevel).toBe("SENIOR");
  });

  it("requires password for admin role", () => {
    expect(() =>
      createInternalMemberSchema.parse({
        fullName: "Admin Internal",
        email: "admin.internal@ajs.local",
        role: "ADMIN"
      })
    ).toThrowError("Password wajib diisi minimal 8 karakter untuk role admin.");
  });
});
