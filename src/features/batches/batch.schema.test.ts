import { describe, expect, it } from "vitest";

import { createBatchSchema } from "@/features/batches/batch.schema";

describe("createBatchSchema", () => {
  it("coerces quota and normalizes optional values from form-like payloads", () => {
    const parsed = createBatchSchema.parse({
      programId: "00000000-0000-0000-0000-000000000021",
      instructorId: "",
      startDate: "2026-05-20T08:00:00.000Z",
      endDate: "2026-05-28T16:00:00.000Z",
      quota: "25",
      price: ""
    });

    expect(parsed.quota).toBe(25);
    expect(parsed.instructorId).toBeNull();
    expect(parsed.price).toBeNull();
  });
});
