import { prisma } from "@/lib/prisma";

export async function listUnitSchemas() {
  return prisma.unitSchema.findMany({
    orderBy: [
      {
        isActive: "desc"
      },
      {
        title: "asc"
      }
    ],
    include: {
      program: {
        select: {
          id: true,
          title: true,
          isActive: true
        }
      },
      units: {
        orderBy: [
          {
            orderIndex: "asc"
          },
          {
            unitCode: "asc"
          }
        ]
      },
      _count: {
        select: {
          units: true
        }
      }
    }
  });
}

export async function listActiveUnitSchemasByProgramIds(programIds: string[]) {
  if (programIds.length === 0) {
    return prisma.unitSchema.findMany({
      where: {
        isActive: true,
        programId: null
      },
      orderBy: [
        {
          title: "asc"
        }
      ],
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        },
        units: {
          orderBy: [
            {
              orderIndex: "asc"
            },
            {
              unitCode: "asc"
            }
          ]
        },
        _count: {
          select: {
            units: true
          }
        }
      }
    });
  }

  return prisma.unitSchema.findMany({
    where: {
      isActive: true,
      OR: [
        {
          programId: {
            in: programIds
          }
        },
        {
          programId: null
        }
      ]
    },
    orderBy: [
      {
        title: "asc"
      }
    ],
    include: {
      program: {
        select: {
          id: true,
          title: true
        }
      },
      units: {
        orderBy: [
          {
            orderIndex: "asc"
          },
          {
            unitCode: "asc"
          }
        ]
      },
      _count: {
        select: {
          units: true
        }
      }
    }
  });
}

export async function findUnitSchemaById(unitSchemaId: string) {
  return prisma.unitSchema.findUnique({
    where: {
      id: unitSchemaId
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          isActive: true
        }
      },
      units: {
        orderBy: [
          {
            orderIndex: "asc"
          },
          {
            unitCode: "asc"
          }
        ]
      },
      _count: {
        select: {
          units: true
        }
      }
    }
  });
}

export async function createUnitSchema(data: {
  programId?: string | null;
  code: string;
  title: string;
  level?: string;
  description?: string;
  isActive?: boolean;
}) {
  return prisma.unitSchema.create({
    data: {
      programId: data.programId ?? null,
      code: data.code,
      title: data.title,
      level: data.level,
      description: data.description,
      isActive: data.isActive ?? true
    }
  });
}

export async function updateUnitSchema(
  unitSchemaId: string,
  data: {
    programId?: string | null;
    code?: string;
    title?: string;
    level?: string | null;
    description?: string | null;
    isActive?: boolean;
  }
) {
  return prisma.unitSchema.update({
    where: {
      id: unitSchemaId
    },
    data: {
      programId: data.programId,
      code: data.code,
      title: data.title,
      level: data.level,
      description: data.description,
      isActive: data.isActive
    }
  });
}

export async function createSchemaUnit(data: {
  unitSchemaId: string;
  unitCode: string;
  title: string;
  orderIndex?: number;
  isMandatory?: boolean;
  criteria?: unknown;
}) {
  return prisma.schemaUnit.create({
    data: {
      unitSchemaId: data.unitSchemaId,
      unitCode: data.unitCode,
      title: data.title,
      orderIndex: data.orderIndex ?? 1,
      isMandatory: data.isMandatory ?? true,
      criteria: data.criteria as never
    }
  });
}
