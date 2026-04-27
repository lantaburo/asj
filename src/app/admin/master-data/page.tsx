import { redirect } from "next/navigation";
import {
  canManageMasterData,
  getCurrentSessionUser
} from "@/features/auth/auth.service";
import { getAdminBatches } from "@/features/batches/batch.service";
import { getClassroomList } from "@/features/classrooms/classroom.service";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";
import { getAdminPrograms } from "@/features/programs/program.service";
import { getSessionList } from "@/features/sessions/session.service";
import { MasterDataApiPanel } from "@/features/admin/master-data-api-panel";
import { getInternalMemberList } from "@/features/users/internal-member.service";

export const dynamic = "force-dynamic";

export default async function AdminMasterDataPage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/masuk?next=/admin/master-data");
  }

  if (!canManageMasterData(currentUser.role)) {
    redirect("/admin");
  }

  const [programs, batches, classrooms, sessions, internalMembers] = await Promise.all([
    getAdminPrograms(),
    getAdminBatches(),
    getClassroomList(),
    getSessionList(),
    getInternalMemberList()
  ]);
  const activeProgramCount = programs.filter((program) => program.isActive).length;
  const openQuotaBatchCount = batches.filter((batch) => batch.quotaRemaining > 0).length;
  const availableClassroomCount = classrooms.filter(
    (classroom) => classroom.isAvailable
  ).length;

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

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px"
        }}
      >
        <div className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="britsafe-card__category">Ringkasan</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '20px', marginTop: '8px' }}>Lihat kesehatan struktur data sebelum melakukan perubahan.</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px"
            }}
          >
            <div style={{ background: 'var(--ajs-gray)', padding: '20px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ajs-navy)', textTransform: 'uppercase', marginBottom: '8px' }}>Program Aktif</div>
              <strong style={{ fontSize: '32px', color: 'var(--ajs-orange)', lineHeight: 1 }}>{activeProgramCount}</strong>
            </div>
            <div style={{ background: 'var(--ajs-gray)', padding: '20px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ajs-navy)', textTransform: 'uppercase', marginBottom: '8px' }}>Batch Terbuka</div>
              <strong style={{ fontSize: '32px', color: 'var(--ajs-orange)', lineHeight: 1 }}>{openQuotaBatchCount}</strong>
            </div>
            <div style={{ background: 'var(--ajs-gray)', padding: '20px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ajs-navy)', textTransform: 'uppercase', marginBottom: '8px' }}>Ruang Siap</div>
              <strong style={{ fontSize: '32px', color: 'var(--ajs-orange)', lineHeight: 1 }}>{availableClassroomCount}</strong>
            </div>
            <div style={{ background: 'var(--ajs-gray)', padding: '20px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ajs-navy)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Session</div>
              <strong style={{ fontSize: '32px', color: 'var(--ajs-orange)', lineHeight: 1 }}>{sessions.length}</strong>
            </div>
          </div>
        </div>

        <div className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="britsafe-card__category">Control Plane</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '20px', marginTop: '8px' }}>Endpoint internal terproteksi session.</h2>
          </div>
          <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ajs-border)' }}>
              <span style={{ color: 'var(--ajs-muted)' }}>Programs</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--ajs-navy)' }}>GET/POST /api/programs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ajs-border)' }}>
              <span style={{ color: 'var(--ajs-muted)' }}>Batches</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--ajs-navy)' }}>GET/POST /api/batches</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ajs-border)' }}>
              <span style={{ color: 'var(--ajs-muted)' }}>Classrooms</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--ajs-navy)' }}>GET/POST /api/classrooms</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ajs-border)' }}>
              <span style={{ color: 'var(--ajs-muted)' }}>Sessions</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--ajs-navy)' }}>GET/POST /api/sessions</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ajs-border)' }}>
              <span style={{ color: 'var(--ajs-muted)' }}>Internal Members</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--ajs-navy)' }}>GET/POST /api/internal-members</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ajs-border)' }}>
              <span style={{ color: 'var(--ajs-muted)' }}>Unit Skema</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--ajs-navy)' }}>GET/POST /api/unit-schemas</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--ajs-border)' }}>
              <span style={{ color: 'var(--ajs-muted)' }}>Update aman</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--ajs-navy)' }}>PATCH /api/*/[id]</strong>
            </div>
          </div>
        </div>
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
          isAvailable: classroom.isAvailable
        }))}
        internalMembers={internalMembers.map((member) => ({
          id: member.id,
          fullName: member.fullName,
          role: member.role,
          instructorLevel: member.instructorLevel
        }))}
      />

      <section className="britsafe-card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <span className="britsafe-card__category">Programs</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '24px', margin: '8px 0 0' }}>Master data program pelatihan</h2>
          </div>
          <div style={{ background: 'var(--ajs-gray)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
            {programs.length} total • {activeProgramCount} aktif
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {programs.map((program) => (
            <article key={program.id} style={{ border: '1px solid var(--ajs-border)', padding: '24px', borderRadius: 'var(--radius-sm)', background: 'white' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: program.isActive ? 'rgba(0,166,81,0.1)' : 'rgba(227,30,36,0.1)', color: program.isActive ? 'var(--ajs-green)' : 'var(--ajs-red)' }}>
                  {program.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: 'var(--ajs-gray)', color: 'var(--ajs-navy)' }}>{program.categoryLabel}</span>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: 'var(--ajs-gray)', color: 'var(--ajs-navy)' }}>{program.industryType}</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--ajs-navy)' }}>{program.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--ajs-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                {program.description ?? "Deskripsi program belum diisi."}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ajs-text)', borderTop: '1px solid var(--ajs-border)', paddingTop: '16px' }}>
                <div>Sektor: <strong>{program.industryType}</strong></div>
                <div>Batch: <strong>{program.batchCount}</strong></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="britsafe-card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <span className="britsafe-card__category">Batches</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '24px', margin: '8px 0 0' }}>Batch dan status operasional</h2>
          </div>
          <div style={{ background: 'var(--ajs-gray)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
            {openQuotaBatchCount} batch tersedia
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {batches.map((batch) => (
            <article key={batch.id} style={{ border: '1px solid var(--ajs-border)', padding: '24px', borderRadius: 'var(--radius-sm)', background: 'white' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ajs-orange)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {batch.status} | {batch.program.title}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ajs-navy)' }}>{formatDateRange(batch.startDate, batch.endDate)}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: 'var(--ajs-muted)', background: 'var(--ajs-gray)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div>Harga: <strong style={{ color: 'var(--ajs-text)' }}>{formatCurrency(batch.price)}</strong></div>
                <div>Sektor: <strong style={{ color: 'var(--ajs-text)' }}>{batch.program.industryType}</strong></div>
                <div>Sisa Kuota: <strong style={{ color: 'var(--ajs-text)' }}>{batch.quotaRemaining} / {batch.quota}</strong></div>
                <div>Instruktur: <strong style={{ color: 'var(--ajs-text)' }}>{batch.instructor?.fullName ?? "TBA"}</strong></div>
                <div>Enrollment: <strong style={{ color: 'var(--ajs-text)' }}>{batch.enrollmentCount}</strong></div>
                <div>Session: <strong style={{ color: 'var(--ajs-text)' }}>{batch.sessionCount}</strong></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px"
        }}
      >
        <section className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="britsafe-card__category">Classrooms</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '20px', margin: '8px 0 8px' }}>Ruang kelas & kapasitas</h2>
            <p style={{ fontSize: '13px', color: 'var(--ajs-muted)' }}>{availableClassroomCount} ruang tersedia untuk penjadwalan.</p>
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

        <section className="britsafe-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="britsafe-card__category">Sessions</span>
            <h2 className="britsafe-card__title" style={{ fontSize: '20px', margin: '8px 0 8px' }}>Jadwal kelas per batch</h2>
            <p style={{ fontSize: '13px', color: 'var(--ajs-muted)' }}>Referensi operasional dan absensi.</p>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {sessions.map((session) => (
              <article key={session.id} style={{ padding: '16px', border: '1px solid var(--ajs-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ajs-navy)' }}>{session.title}</h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', background: 'var(--ajs-gray)', color: 'var(--ajs-muted)', borderRadius: '4px' }}>{session.locationType}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--ajs-muted)' }}>
                  <div>Program: <strong style={{ color: 'var(--ajs-text)' }}>{session.batch.program.title}</strong></div>
                  <div>Ruang: <strong style={{ color: 'var(--ajs-text)' }}>{session.classroom?.roomName ?? "N/A"}</strong></div>
                  <div>Instruktur: <strong style={{ color: 'var(--ajs-text)' }}>{session.instructor?.fullName ?? "TBA"}</strong></div>
                  <div>Absensi: <strong style={{ color: 'var(--ajs-text)' }}>{session.attendanceCount} masuk</strong></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
