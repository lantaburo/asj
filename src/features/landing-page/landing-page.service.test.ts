import {
  compareDateStrings,
  countAvailableSeats,
  countOpenBatches,
  formatCurrency,
  formatDateRange
} from "@/features/landing-page/landing-page.service";

describe("landing-page service helpers", () => {
  const programs = [
    {
      id: "program-1",
      title: "Ahli K3 Umum",
      category: "KEMENAKER" as const,
      customCategory: null,
      categoryLabel: "KEMENAKER",
      industryType: "Umum",
      description: null,
      openBatches: [
        {
          id: "batch-1",
          startDate: "2026-05-01T00:00:00.000Z",
          endDate: "2026-05-10T00:00:00.000Z",
          quota: 20,
          quotaRemaining: 7,
          price: 4500000,
          status: "OPEN" as const,
          instructorName: "Instruktur A"
        },
        {
          id: "batch-2",
          startDate: "2026-06-01T00:00:00.000Z",
          endDate: "2026-06-10T00:00:00.000Z",
          quota: 15,
          quotaRemaining: 4,
          price: null,
          status: "OPEN" as const,
          instructorName: null
        }
      ]
    }
  ];

  it("counts open batches across programs", () => {
    expect(countOpenBatches(programs)).toBe(2);
  });

  it("sums available seats across open batches", () => {
    expect(countAvailableSeats(programs)).toBe(11);
  });

  it("formats currency for Indonesian rupiah", () => {
    expect(formatCurrency(4500000)).toContain("4.500.000");
  });

  it("returns fallback text for empty price", () => {
    expect(formatCurrency(null)).toBe("Hubungi Admin");
  });

  it("formats a readable date range", () => {
    expect(
      formatDateRange("2026-05-01T00:00:00.000Z", "2026-05-10T00:00:00.000Z")
    ).toContain("2026");
  });

  it("returns a safe fallback for invalid dates", () => {
    expect(formatDateRange("invalid-date", "2026-05-10T00:00:00.000Z")).toBe(
      "Jadwal akan diumumkan"
    );
  });

  it("sorts invalid dates after valid dates", () => {
    expect(compareDateStrings("2026-05-01T00:00:00.000Z", "invalid-date")).toBeLessThan(0);
    expect(compareDateStrings("invalid-date", "2026-05-01T00:00:00.000Z")).toBeGreaterThan(0);
  });
});
