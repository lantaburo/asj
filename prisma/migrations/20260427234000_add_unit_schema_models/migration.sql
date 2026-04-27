-- Add UnitSchema table as master for scheme-level competency definition.
CREATE TABLE "UnitSchema" (
    "id" TEXT NOT NULL,
    "programId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitSchema_pkey" PRIMARY KEY ("id")
);

-- Add SchemaUnit table as detail rows per schema.
CREATE TABLE "SchemaUnit" (
    "id" TEXT NOT NULL,
    "unitSchemaId" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 1,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "criteria" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemaUnit_pkey" PRIMARY KEY ("id")
);

-- Unique and access indexes.
CREATE UNIQUE INDEX "UnitSchema_code_key" ON "UnitSchema"("code");
CREATE UNIQUE INDEX "SchemaUnit_unitSchemaId_unitCode_key" ON "SchemaUnit"("unitSchemaId", "unitCode");
CREATE INDEX "SchemaUnit_unitSchemaId_orderIndex_idx" ON "SchemaUnit"("unitSchemaId", "orderIndex");

-- Relations.
ALTER TABLE "UnitSchema" ADD CONSTRAINT "UnitSchema_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SchemaUnit" ADD CONSTRAINT "SchemaUnit_unitSchemaId_fkey" FOREIGN KEY ("unitSchemaId") REFERENCES "UnitSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;
