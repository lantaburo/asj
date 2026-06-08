import { redirect } from "next/navigation";
import Link from "next/link";
import {
  canManageMasterData,
  getCurrentSessionUser
} from "@/features/auth/auth.service";
import { getAdminBatches } from "@/features/batches/batch.service";
import { getClassroomList } from "@/features/classrooms/classroom.service";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";
import { getAdminPrograms, getProgramStatisticsList } from "@/features/programs/program.service";
import { getSessionList } from "@/features/sessions/session.service";
import { getUnitSchemaList } from "@/features/unit-schemas/unit-schema.service";
import { MasterDataApiPanel } from "@/features/admin/master-data-api-panel";
import { getInternalMemberList } from "@/features/users/internal-member.service";
import { CrudActions } from "@/features/admin/crud-actions";
import { MasterDataExplorer } from "@/features/admin/master-data-explorer";
import { ProgramStatisticsTree } from "@/features/admin/program-statistics-tree";

export const dynamic = "force-dynamic";

export default async function AdminBuatProgramPage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/masuk?next=/admin/buat-program");
  }

  if (!canManageMasterData(currentUser.role)) {
    redirect("/admin");
  }

  const [programs, batches, classrooms, sessions, internalMembers, unitSchemas, programStats] = await Promise.all([
    getAdminPrograms(),
    getAdminBatches(),
    getClassroomList(),
    getSessionList(),
    getInternalMemberList(),
    getUnitSchemaList(),
    getProgramStatisticsList()
  ]);

  return (
    <div style={{ display: 'grid', gap: '40px' }}>
      <section className="britsafe-card" style={{ padding: '40px', borderTop: '4px solid var(--ajs-orange)' }}>
        <span className="britsafe-card__category">Phase 3 Master Data</span>
        <h1 className="britsafe-card__title" style={{ fontSize: '28px', marginTop: '16px', marginBottom: '16px' }}>
          Source of truth pelatihan, dibingkai sebagai ruang kerja yang lebih taktis.
        </h1>
        <p className="britsafe-card__copy" style={{ maxWidth: '860px', fontSize: '16px' }}>
          Halaman ini menampilkan program, batch, classroom, dan session yang
          menjadi sumber data operasional sekaligus sumber data landing page
          publik ARKAMA JAYA SERTIFIKASI.
        </p>
      </section>


      <MasterDataApiPanel
        programs={programs.map((program) => ({
          id: program.id,
          title: program.title,
          isActive: program.isActive
        }))}
        batches={batches.map((batch) => ({
          id: batch.id,
          status: batch.status,
          programTitle: batch.program.title
        }))}
        classrooms={classrooms.map((classroom) => ({
          id: classroom.id,
          roomName: classroom.roomName,
          isAvailable: classroom.isAvailable,
          capacity: classroom.capacity
        }))}
        internalMembers={internalMembers.map((member) => ({
          id: member.id,
          fullName: member.fullName,
          role: member.role,
          instructorLevel: member.instructorLevel
        }))}
        unitSchemas={unitSchemas.map((us) => ({
          id: us.id,
          title: us.title,
          description: us.description ?? "",
          level: us.level ?? ""
        }))}
      />

      <section style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="britsafe-card__category">Statistik & Presensi</span>
          <h2 className="britsafe-card__title" style={{ fontSize: '24px', margin: '8px 0 0' }}>Program, Batch & Sesi</h2>
          <p style={{ fontSize: '14px', color: 'var(--ajs-muted)', marginTop: '6px' }}>
            Kelola sesi, lihat peserta, dan buka QR presensi kamera.
          </p>
        </div>
        <ProgramStatisticsTree
          programs={programStats}
          classrooms={classrooms.map(c => ({ id: c.id, roomName: c.roomName }))}
          instructors={internalMembers.map(m => ({ id: m.id, fullName: m.fullName }))}
        />
      </section>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="britsafe-card__category">Explorer Data</span>
          <h2 className="britsafe-card__title" style={{ fontSize: '24px', margin: '8px 0 0' }}>Manajemen Program, Batch & Sesi</h2>
        </div>
        <MasterDataExplorer
          programs={programs}
          batches={batches}
          sessions={sessions}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px"
        }}
      >
        <section id="classrooms" className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="britsafe-card__category">Classrooms</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '20px', margin: '8px 0 8px' }}>Ruang kelas & kapasitas</h2>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {classrooms.map((classroom) => (
              <article key={classroom.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--ajs-border)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ajs-navy)', marginBottom: '4px' }}>{classroom.roomName}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--ajs-muted)' }}>Kapasitas: {classroom.capacity} • Session: {classroom.sessionCount}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', background: classroom.isAvailable ? 'rgba(0,166,81,0.1)' : 'rgba(227,30,36,0.1)', color: classroom.isAvailable ? 'var(--ajs-green)' : 'var(--ajs-red)' }}>
                  {classroom.isAvailable ? "Tersedia" : "Penuh"}
                </span>
              </article>
            ))}
          </div>
        </section>


      </section>
    </div>
  );
}
