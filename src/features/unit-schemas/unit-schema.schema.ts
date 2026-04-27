import { z } from "zod";

const schemaCodeRegex = /^[A-Z0-9][A-Z0-9._-]{2,39}$/;
const unitCodeRegex = /^[A-Z0-9][A-Z0-9._-]{2,39}$/;

const optionalProgramId = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().uuid().optional());

const normalizedSchemaCode = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().toUpperCase();
}, z.string().regex(schemaCodeRegex, "Kode skema tidak valid."));

const normalizedUnitCode = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().toUpperCase();
}, z.string().regex(unitCodeRegex, "Kode unit tidak valid."));

const optionalLevel = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(2).max(80).optional());

const optionalDescription = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(3).max(500).optional());

export const createUnitSchemaSchema = z.object({
  programId: optionalProgramId,
  code: normalizedSchemaCode,
  title: z.string().trim().min(3).max(160),
  level: optionalLevel,
  description: optionalDescription,
  isActive: z.boolean().optional()
});

export const updateUnitSchemaSchema = createUnitSchemaSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Minimal satu field harus diubah."
  });

export const createSchemaUnitSchema = z.object({
  unitCode: normalizedUnitCode,
  title: z.string().trim().min(3).max(180),
  orderIndex: z.coerce.number().int().min(1).max(999).optional(),
  isMandatory: z.boolean().optional(),
  criteria: z.unknown().optional()
});
