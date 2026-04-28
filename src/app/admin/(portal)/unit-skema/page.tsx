import { redirect } from "next/navigation";

import {
  canManageMasterData,
  getCurrentSessionUser
} from "@/features/auth/auth.service";
import { getAdminPrograms } from "@/features/programs/program.service";
import {
  getUnitSchemaList
} from "@/features/unit-schemas/unit-schema.service";
import { UnitSchemaAdminPanel } from "@/features/unit-schemas/unit-schema-admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminUnitSkemaPage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/masuk?next=/admin/unit-skema");
  }

  if (!canManageMasterData(currentUser.role)) {
    redirect("/admin");
  }

  const [programs, unitSchemas] = await Promise.all([
    getAdminPrograms(),
    getUnitSchemaList()
  ]);

  const totalUnits = unitSchemas.reduce(
    (total, schema) => total + schema.unitCount,
    0
  );
  const activeSchemaCount = unitSchemas.filter((schema) => schema.isActive).length;

  return (
    <div style={{ display: "grid", gap: "40px" }}>
      <section
        className="britsafe-card"
        style={{ padding: "40px", borderTop: "4px solid var(--ajs-orange)" }}
      >
        <span className="britsafe-card__category">Master Data Unit Skema</span>
        <h1
          className="britsafe-card__title"
          style={{ fontSize: "28px", marginTop: "16px", marginBottom: "16px" }}
        >
          Repository unit kompetensi untuk instruktur, asesor, dan peserta.
        </h1>
        <p
          className="britsafe-card__copy"
          style={{ maxWidth: "860px", fontSize: "16px" }}
        >
          Halaman ini memusatkan pengelolaan skema kompetensi dan unit-unit
          penilaian agar proses pembelajaran hingga sertifikasi tetap sinkron.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}
      >
        <article className="britsafe-card" style={{ padding: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--ajs-muted)",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}
          >
            Skema Aktif
          </div>
          <strong style={{ fontSize: "32px", color: "var(--ajs-orange)" }}>
            {activeSchemaCount}
          </strong>
        </article>
        <article className="britsafe-card" style={{ padding: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--ajs-muted)",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}
          >
            Total Unit
          </div>
          <strong style={{ fontSize: "32px", color: "var(--ajs-orange)" }}>
            {totalUnits}
          </strong>
        </article>
        <article className="britsafe-card" style={{ padding: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--ajs-muted)",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}
          >
            Program Terkait
          </div>
          <strong style={{ fontSize: "32px", color: "var(--ajs-orange)" }}>
            {
              unitSchemas.filter((schema) => schema.program !== null).length
            }
          </strong>
        </article>
      </section>

      <UnitSchemaAdminPanel
        programs={programs.map((program) => ({
          id: program.id,
          title: program.title,
          isActive: program.isActive
        }))}
        schemas={unitSchemas.map((schema) => ({
          id: schema.id,
          code: schema.code,
          title: schema.title,
          level: schema.level,
          isActive: schema.isActive,
          program: schema.program
            ? {
                id: schema.program.id,
                title: schema.program.title
              }
            : null,
          unitCount: schema.unitCount,
          units: schema.units.map((unit) => ({
            id: unit.id,
            unitCode: unit.unitCode,
            title: unit.title,
            orderIndex: unit.orderIndex,
            isMandatory: unit.isMandatory
          }))
        }))}
      />
    </div>
  );
}
