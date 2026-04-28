const { z } = require("zod");

const ProgramCategory = {
  BNSP: "BNSP",
  KEMENAKER: "KEMENAKER",
  INHOUSE: "INHOUSE",
  SERTIFIKASI: "SERTIFIKASI",
  AUDIT: "AUDIT",
  LAINNYA: "LAINNYA"
};

const optionalCustomCategory = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}, z.string().min(2).max(80).nullable().optional());

const programBaseSchema = z.object({
  title: z.string().trim().min(3).max(150),
  category: z.nativeEnum(ProgramCategory),
  customCategory: optionalCustomCategory,
  industryType: z.string().trim().min(2).max(100).default("Umum"),
  description: z.string().trim().max(5000).nullable().optional(),
  curriculum: z.unknown().optional(),
  isActive: z.boolean().optional()
});

const createProgramSchema = programBaseSchema.refine(
  (value) =>
    value.category !== ProgramCategory.LAINNYA ||
    (value.customCategory ?? "").trim().length > 0,
  {
    path: ["customCategory"],
    message: "Custom kategori wajib diisi saat kategori LAINNYA."
  }
);

try {
  createProgramSchema.parse({
    title: "Ahli K3 Umum",
    category: "KEMENAKER",
    customCategory: null,
    industryType: "Umum",
    description: null,
    isActive: true
  });
  console.log("Success with valid data");
} catch(e) {
  console.log(e.errors);
}

try {
  createProgramSchema.parse({
    title: "A",
    category: "KEMENAKER",
    customCategory: null,
    industryType: "Umum",
    description: null,
    isActive: true
  });
} catch(e) {
  console.log("Too short title:", e.errors[0].message);
}

