import { getAdminEnrollments } from "@/features/enrollments/enrollment.service";
import { getK3LogList } from "@/features/k3-logs/k3-log.service";
import { AssessmentPanel } from "@/features/enrollments/assessment-panel";

export const dynamic = "force-dynamic";

export default async function CertificationAdminPage() {
  const [enrollments, logs] = await Promise.all([
    getAdminEnrollments(),
    getK3LogList()
  ]);

  const issuedCertificateCount = enrollments.filter(e => e.certificateNum).length;
  const verifiedLogCount = logs.filter(l => l.verifiedBy).length;
  const kompeten = enrollments.filter(e => e.assessmentStatus === "KOMPETEN").length;

  return (
    <div style={{ display: 'grid', gap: '40px' }}>
      {/* Header */}
      <section className="britsafe-card" style={{ padding: '40px', borderTop: '4px solid var(--ajs-teal)' }}>
        <span className="britsafe-card__category">Phase 8 — Sertifikasi Aktif</span>
        <h1 className="britsafe-card__title" style={{ fontSize: '28px', marginTop: '16px', marginBottom: '16px' }}>
          Panel Verifikasi & Penerbitan Sertifikat K3
        </h1>
        <p className="britsafe-card__copy" style={{ maxWidth: '820px', fontSize: '16px' }}>
          Klik nama peserta untuk membuka detail logbook, verifikasi aktivitas praktik, dan ubah status kompetensi.
          Sertifikat bernomor otomatis diterbitkan saat status diubah menjadi <strong>Kompeten</strong>.
        </p>
      </section>

      {/* KPI Strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { label: "Total Peserta", value: enrollments.length, color: "var(--ajs-navy)" },
          { label: "Dinyatakan Kompeten", value: kompeten, color: "var(--ajs-green)" },
          { label: "Sertifikat Terbit", value: issuedCertificateCount, color: "var(--ajs-orange)" },
          { label: "Log K3 Terverifikasi", value: verifiedLogCount, color: "var(--ajs-teal)" },
        ].map(kpi => (
          <div key={kpi.label} className="britsafe-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ajs-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{kpi.label}</div>
            <strong style={{ fontSize: '36px', color: kpi.color, lineHeight: 1 }}>{kpi.value}</strong>
          </div>
        ))}
      </section>

      {/* Interactive Panel */}
      <section>
        <div style={{ marginBottom: '20px' }}>
          <h2 className="britsafe-card__title" style={{ fontSize: '20px' }}>Daftar Peserta & Status Kompetensi</h2>
          <p style={{ fontSize: '13px', color: 'var(--ajs-muted)', marginTop: '4px' }}>Klik pada baris peserta untuk membuka panel aksi verifikasi dan penilaian.</p>
        </div>
        <AssessmentPanel enrollments={enrollments} logs={logs} />
      </section>
    </div>
  );
}
