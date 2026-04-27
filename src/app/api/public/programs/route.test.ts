import { GET } from "@/app/api/public/programs/route";
import { getPublicPrograms } from "@/features/programs/program.service";

vi.mock("@/features/programs/program.service", () => ({
  getPublicPrograms: vi.fn()
}));

const mockedGetPublicPrograms = vi.mocked(getPublicPrograms);

describe("GET /api/public/programs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns public programs payload", async () => {
    mockedGetPublicPrograms.mockResolvedValueOnce([
      {
        id: "program-1",
        title: "Ahli K3 Umum",
        category: "KEMENAKER",
        customCategory: null,
        categoryLabel: "KEMENAKER",
        industryType: "Umum",
        description: "Program inti",
        openBatches: []
      }
    ]);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.programs).toHaveLength(1);
    expect(payload.data.programs[0].title).toBe("Ahli K3 Umum");
  });
});
