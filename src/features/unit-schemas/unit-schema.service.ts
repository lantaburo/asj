import { AppError } from "@/lib/app-error";
import {
  createSchemaUnitSchema,
  createUnitSchemaSchema,
  updateUnitSchemaSchema
} from "@/features/unit-schemas/unit-schema.schema";
import {
  createSchemaUnit,
  createUnitSchema,
  findUnitSchemaById,
  listActiveUnitSchemasByProgramIds,
  listUnitSchemas,
  updateUnitSchema
} from "@/features/unit-schemas/unit-schema.repository";

function mapUnitSchema(schema: Awaited<ReturnType<typeof listUnitSchemas>>[number]) {
  return {
    id: schema.id,
    code: schema.code,
    title: schema.title,
    level: schema.level,
    description: schema.description,
    isActive: schema.isActive,
    createdAt: schema.createdAt.toISOString(),
    updatedAt: schema.updatedAt.toISOString(),
    program: schema.program
      ? {
          id: schema.program.id,
          title: schema.program.title,
          isActive: schema.program.isActive
        }
      : null,
    unitCount: schema._count.units,
    units: schema.units.map((unit) => ({
      id: unit.id,
      unitCode: unit.unitCode,
      title: unit.title,
      orderIndex: unit.orderIndex,
      isMandatory: unit.isMandatory,
      criteria: unit.criteria
    }))
  };
}

function mapParticipantUnitSchema(
  schema: Awaited<ReturnType<typeof listActiveUnitSchemasByProgramIds>>[number]
) {
  return {
    id: schema.id,
    code: schema.code,
    title: schema.title,
    level: schema.level,
    description: schema.description,
    program: schema.program
      ? {
          id: schema.program.id,
          title: schema.program.title
        }
      : null,
    unitCount: schema._count.units,
    units: schema.units.map((unit) => ({
      id: unit.id,
      unitCode: unit.unitCode,
      title: unit.title,
      orderIndex: unit.orderIndex,
      isMandatory: unit.isMandatory
    }))
  };
}

export async function getUnitSchemaList() {
  const schemas = await listUnitSchemas();
  return schemas.map(mapUnitSchema);
}

export async function getUnitSchemaDetail(unitSchemaId: string) {
  const schema = await findUnitSchemaById(unitSchemaId);

  if (!schema) {
    throw new AppError("Skema unit tidak ditemukan.", {
      statusCode: 404,
      code: "UNIT_SCHEMA_NOT_FOUND"
    });
  }

  return mapUnitSchema(schema);
}

export async function createUnitSchemaRecord(payload: unknown) {
  const parsed = createUnitSchemaSchema.parse(payload);
  const schema = await createUnitSchema({
    programId: parsed.programId ?? null,
    code: parsed.code,
    title: parsed.title,
    level: parsed.level,
    description: parsed.description,
    isActive: parsed.isActive ?? true
  });

  return getUnitSchemaDetail(schema.id);
}

export async function updateUnitSchemaRecord(unitSchemaId: string, payload: unknown) {
  const parsed = updateUnitSchemaSchema.parse(payload);
  const existing = await findUnitSchemaById(unitSchemaId);

  if (!existing) {
    throw new AppError("Skema unit tidak ditemukan.", {
      statusCode: 404,
      code: "UNIT_SCHEMA_NOT_FOUND"
    });
  }

  await updateUnitSchema(unitSchemaId, {
    programId:
      parsed.programId === undefined ? undefined : (parsed.programId ?? null),
    code: parsed.code,
    title: parsed.title,
    level: parsed.level === undefined ? undefined : (parsed.level ?? null),
    description:
      parsed.description === undefined ? undefined : (parsed.description ?? null),
    isActive: parsed.isActive
  });

  return getUnitSchemaDetail(unitSchemaId);
}

export async function createSchemaUnitRecord(unitSchemaId: string, payload: unknown) {
  const parsed = createSchemaUnitSchema.parse(payload);
  const schema = await findUnitSchemaById(unitSchemaId);

  if (!schema) {
    throw new AppError("Skema unit tidak ditemukan.", {
      statusCode: 404,
      code: "UNIT_SCHEMA_NOT_FOUND"
    });
  }

  await createSchemaUnit({
    unitSchemaId,
    unitCode: parsed.unitCode,
    title: parsed.title,
    orderIndex: parsed.orderIndex ?? schema._count.units + 1,
    isMandatory: parsed.isMandatory ?? true,
    criteria: parsed.criteria
  });

  return getUnitSchemaDetail(unitSchemaId);
}

export async function getParticipantUnitSchemaCatalog(programIds: string[]) {
  const schemas = await listActiveUnitSchemasByProgramIds(programIds);
  return schemas.map(mapParticipantUnitSchema);
}
