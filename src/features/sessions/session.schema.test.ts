import { describe, expect, it } from "vitest";

import { createSessionSchema } from "@/features/sessions/session.schema";

describe("createSessionSchema", () => {
  it("normalizes empty optional ids to null", () => {
    const parsed = createSessionSchema.parse({
      batchId: "00000000-0000-0000-0000-000000000031",
      classroomId: "",
      instructorId: "",
      title: "Sesi Uji",
      sessionDate: "2026-05-21T08:00:00.000Z",
      startTime: "2026-05-21T08:00:00.000Z",
      endTime: "2026-05-21T10:00:00.000Z"
    });

    expect(parsed.classroomId).toBeNull();
    expect(parsed.instructorId).toBeNull();
  });
});
