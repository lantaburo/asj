import { describe, expect, it } from "vitest";

import { createClassroomSchema } from "@/features/classrooms/classroom.schema";

describe("createClassroomSchema", () => {
  it("coerces capacity from string input", () => {
    const parsed = createClassroomSchema.parse({
      roomName: "Ruang Uji",
      capacity: "30",
      isAvailable: true
    });

    expect(parsed.capacity).toBe(30);
  });
});
