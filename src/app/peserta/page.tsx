import Link from "next/link";
import { redirect } from "next/navigation";

import { AJSLogo } from "@/features/landing-page/logo";
import { getCurrentSessionUser } from "@/features/auth/auth.service";
import { ParticipantLogoutButton } from "@/features/auth/participant-logout-button";
import { getParticipantEnrollments } from "@/features/enrollments/enrollment.service";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";
import { ParticipantDocumentsPanel } from "@/features/participant-documents/participant-documents-panel";
import { getParticipantDocuments } from "@/features/participant-documents/participant-document.service";
import { getParticipantUnitSchemaCatalog } from "@/features/unit-schemas/unit-schema.service";

export const dynamic = "force-dynamic";

function statusBadgeStyle(status: string) {
  if (status === "KOMPETEN") {
    return {
      background: "rgba(0,166,81,0.1)",
      color: "var(--ajs-green)"
    };
  }

  if (status === "BELUM_KOMPETEN") {
    return {
      background: "rgba(227,30,36,0.1)",
      color: "var(--ajs-red)"
    };
  }

  return {
    background: "var(--ajs-gray)",
    color: "var(--ajs-muted)"
  };
}

export default async function PesertaDashboardPage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/peserta/masuk?next=/peserta");
  }

  if (currentUser.role !== "TRAINEE") {
    redirect("/admin");
  }

  const [enrollments, participantDocuments] = await Promise.all([
    getParticipantEnrollments(currentUser.id),
    getParticipantDocuments(currentUser.id)
  ]);
  const programIds = Array.from(
    new Set(enrollments.map((enrollment) => enrollment.program.id))
  );
  const unitSchemas = await getParticipantUnitSchemaCatalog(programIds);
  const totalLogs = enrollments.reduce(
    (total, enrollment) => total + enrollment.k3LogCount,
    0
  );
  const issuedCertificates = enrollments.filter(
    (enrollment) => enrollment.certificateNum
  ).length;

  return (
    <div className="britsafe-site">
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <input type="checkbox" id="mobile-menu-toggle" className="mobile-menu-toggle" aria-label="Toggle mobile menu" />
          <label htmlFor="mobile-menu-toggle" className="mobile-menu-button">
            <span></span><span></span><span></span>
          </label>
          <nav className="britsafe-nav">
            <Link href="/daftar">Daftar Pelatihan</Link>
            <Link href="/masuk" className="britsafe-btn-auth">
              Workspace Internal
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ padding: "60px 0", background: "var(--ajs-gray)" }}>
        <div className="container" style={{ display: "grid", gap: "24px" }}>
          <section
            className="britsafe-card"
            style={{ padding: "32px", borderTop: "4px solid var(--ajs-teal)" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
                alignItems: "start"
              }}
            >
              <div>
                <span className="britsafe-card__category">Dashboard Peserta</span>
                <h1
                  className="britsafe-card__title"
                  style={{ fontSize: "28px", margin: "10px 0" }}
                >
                  Halo, {currentUser.fullName}. Pantau progres belajarmu di sini.
                </h1>
                <p className="britsafe-card__copy" style={{ margin: 0 }}>
                  Dashboard ini merangkum status pendaftaran, logbook praktik K3, dan
                  informasi skema unit kompetensi yang relevan dengan programmu.
                </p>
              </div>

              <aside
                style={{
                  display: "grid",
                  gap: "14px",
                  padding: "18px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--ajs-border)",
                  background: "rgba(244, 121, 32, 0.04)"
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                  Masuk sebagai
                </div>
                <strong style={{ color: "var(--ajs-navy)" }}>
                  {currentUser.email ?? currentUser.phone ?? currentUser.fullName}
                </strong>
                <ParticipantLogoutButton />
              </aside>
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px"
            }}
          >
            <article className="britsafe-card" style={{ padding: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--ajs-muted)",
                  marginBottom: "8px"
                }}
              >
                Total Enrollment
              </div>
              <strong style={{ fontSize: "28px", color: "var(--ajs-orange)" }}>
                {enrollments.length}
              </strong>
            </article>
            <article className="britsafe-card" style={{ padding: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--ajs-muted)",
                  marginBottom: "8px"
                }}
              >
                Log Praktik
              </div>
              <strong style={{ fontSize: "28px", color: "var(--ajs-orange)" }}>
                {totalLogs}
              </strong>
            </article>
            <article className="britsafe-card" style={{ padding: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--ajs-muted)",
                  marginBottom: "8px"
                }}
              >
                Sertifikat Terbit
              </div>
              <strong style={{ fontSize: "28px", color: "var(--ajs-orange)" }}>
                {issuedCertificates}
              </strong>
            </article>
            <article className="britsafe-card" style={{ padding: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--ajs-muted)",
                  marginBottom: "8px"
                }}
              >
                Skema Tersedia
              </div>
              <strong style={{ fontSize: "28px", color: "var(--ajs-orange)" }}>
                {unitSchemas.length}
              </strong>
            </article>
            <article className="britsafe-card" style={{ padding: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--ajs-muted)",
                  marginBottom: "8px"
                }}
              >
                Dokumen Tersimpan
              </div>
              <strong style={{ fontSize: "28px", color: "var(--ajs-orange)" }}>
                {participantDocuments.length}
              </strong>
            </article>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px"
            }}
          >
            <article className="britsafe-card" style={{ padding: "24px" }}>
              <h2
                className="britsafe-card__title"
                style={{ fontSize: "20px", marginBottom: "10px" }}
              >
                Enrollment Saya
              </h2>
              {enrollments.length === 0 ? (
                <p style={{ fontSize: "14px", color: "var(--ajs-muted)", margin: 0 }}>
                  Kamu belum punya enrollment aktif. Silakan daftar batch dulu.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {enrollments.map((enrollment) => (
                    <article
                      key={enrollment.id}
                      style={{
                        border: "1px solid var(--ajs-border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "12px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "8px",
                          marginBottom: "6px"
                        }}
                      >
                        <strong style={{ fontSize: "14px", color: "var(--ajs-navy)" }}>
                          {enrollment.program.title}
                        </strong>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "4px",
                            padding: "2px 6px",
                            ...statusBadgeStyle(enrollment.assessmentStatus)
                          }}
                        >
                          {enrollment.assessmentStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                        Batch:{" "}
                        {formatDateRange(
                          enrollment.batch.startDate,
                          enrollment.batch.endDate
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                        Log praktik: {enrollment.k3LogCount}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                        Nomor sertifikat: {enrollment.certificateNum ?? "Belum terbit"}
                      </div>

                      {enrollment.invoice && (
                        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--ajs-gray)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ajs-muted)' }}>STATUS PEMBAYARAN</span>
                            <span style={{ 
                              fontSize: '10px', 
                              fontWeight: 'bold', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              background: enrollment.invoice.status === 'PAID' ? '#E8F5E9' : '#FFF3E0',
                              color: enrollment.invoice.status === 'PAID' ? '#2E7D32' : '#E65100'
                            }}>
                              {enrollment.invoice.status === 'PAID' ? 'LUNAS' : 
                               enrollment.invoice.status === 'PENDING_VERIFICATION' ? 'MENUNGGU VERIFIKASI' : 
                               enrollment.invoice.status === 'REJECTED' ? 'DITOLAK' : 'BELUM DIBAYAR'}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--ajs-navy)' }}>
                            {formatCurrency(enrollment.invoice.amount)}
                          </div>
                          {enrollment.invoice.status !== 'PAID' && enrollment.invoice.status !== 'PENDING_VERIFICATION' && (
                            <Link 
                              href={`/checkout/${enrollment.invoice.id}`}
                              className="btn btn-primary"
                              style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '12px', textAlign: 'center' }}
                            >
                              Bayar Sekarang
                            </Link>
                          )}
                          {enrollment.invoice.status === 'PENDING_VERIFICATION' && (
                            <p style={{ fontSize: '11px', color: 'var(--ajs-muted)', margin: '4px 0 0 0' }}>
                              Bukti transfer sedang diperiksa oleh admin.
                            </p>
                          )}
                        </div>
                      )}
                      {enrollment.certificateNum ? (
                        <Link
                          href={`/verifikasi/${enrollment.qrVerifyCode}`}
                          style={{
                            display: "inline-block",
                            marginTop: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "var(--ajs-teal)"
                          }}
                        >
                          Lihat verifikasi sertifikat
                        </Link>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="britsafe-card" style={{ padding: "24px" }}>
              <h2
                className="britsafe-card__title"
                style={{ fontSize: "20px", marginBottom: "10px" }}
              >
                Unit Skema Terkait
              </h2>
              {unitSchemas.length === 0 ? (
                <p style={{ fontSize: "14px", color: "var(--ajs-muted)", margin: 0 }}>
                  Belum ada skema yang dipublikasikan untuk programmu.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {unitSchemas.map((schema) => (
                    <article
                      key={schema.id}
                      style={{
                        border: "1px solid var(--ajs-border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "12px"
                      }}
                    >
                      <strong style={{ display: "block", marginBottom: "4px" }}>
                        {schema.code} - {schema.title}
                      </strong>
                      <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                        Program: {schema.program?.title ?? "Skema umum"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                        Jumlah unit: {schema.unitCount}
                      </div>
                      {schema.units.length > 0 ? (
                        <ul
                          style={{
                            margin: "8px 0 0",
                            paddingLeft: "18px",
                            fontSize: "12px",
                            color: "var(--ajs-text)"
                          }}
                        >
                          {schema.units.slice(0, 4).map((unit) => (
                            <li key={unit.id}>
                              {unit.unitCode} - {unit.title}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </article>
          </section>

          {enrollments.length > 0 && (
            <section className="britsafe-card" style={{ padding: "24px" }}>
              <h2 className="britsafe-card__title" style={{ fontSize: "20px", marginBottom: "6px" }}>
                Persyaratan Pendaftaran
              </h2>
              <p style={{ fontSize: "13px", color: "var(--ajs-muted)", marginBottom: "20px" }}>
                Pastikan semua dokumen berikut telah disiapkan dan diunggah sebelum pelaksanaan diklat.
              </p>
              <a
                href="#dokumen-saya"
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                Tambah Dokumen
              </a>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--ajs-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                    Dokumen Wajib
                  </p>
                  {([
                    { label: "KTP (Kartu Tanda Penduduk)",       type: "KTP"        },
                    { label: "CV (Curriculum Vitae)",             type: "CV"         },
                    { label: "Pas Foto Background Merah",         type: "PAS_FOTO"   },
                    { label: "Surat Pengalaman Kerja / Paklaring",type: "SURAT_KERJA"},
                  ] as const).map((item) => {
                    const uploaded = participantDocuments.some((d) => d.type === item.type);
                    return (
                      <div key={item.type} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                        <div style={{
                          width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                          background: uploaded ? "rgba(0,166,81,0.15)" : "rgba(0,0,0,0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {uploaded ? (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="#00A651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--ajs-muted)" }} />
                          )}
                        </div>
                        <span style={{ fontSize: "14px", color: uploaded ? "var(--ajs-navy)" : "var(--ajs-muted)" }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--ajs-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                    Pendidikan & Pengalaman Kerja
                  </p>
                  {[
                    "Ijazah SMA + Pengalaman Kerja Min. 10 Tahun",
                    "Ijazah D3 + Pengalaman Kerja Min. 3 Tahun",
                    "Ijazah S1 + Pengalaman Kerja Min. 1 Tahun",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                        background: "rgba(234,115,25,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--ajs-orange)" }} />
                      </div>
                      <span style={{ fontSize: "14px", color: "var(--ajs-muted)" }}>{item}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: "12px", color: "var(--ajs-muted)", marginTop: "8px", fontStyle: "italic" }}>
                    * Pilih salah satu yang sesuai dengan latar belakang pendidikan Anda.
                  </p>
                </div>
              </div>
            </section>
          )}

          <ParticipantDocumentsPanel initialDocuments={participantDocuments} />
        </div>
      </main>
    </div>
  );
}
