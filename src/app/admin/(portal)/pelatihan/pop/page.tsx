import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser, canAccessAdminPortal } from "@/features/auth/auth.service";
import { formatDateRange, formatCurrency } from "@/features/landing-page/landing-page.service";
import type { ParticipantDocumentRecord } from "@/features/participant-documents/participant-document.types";

export const dynamic = "force-dynamic";

const WA_ADMIN = "6282396792362";

const invoiceStatusLabel: Record<string, { label: string; color: string; bg: string }> = {
  UNPAID:               { label: "Belum Bayar",     color: "#e31e24", bg: "rgba(227,30,36,0.08)" },
  PENDING_VERIFICATION: { label: "Menunggu Verif",  color: "#f57c00", bg: "rgba(245,124,0,0.1)"  },
  PAID:                 { label: "Lunas",            color: "var(--ajs-green)", bg: "rgba(0,166,81,0.1)" },
  CANCELLED:            { label: "Dibatalkan",       color: "var(--ajs-muted)", bg: "var(--ajs-gray)" },
};

async function getPOPEnrollments() {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      batch: { program: { title: { contains: "POP" } } }
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          participantDocuments: true
        }
      },
      batch: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          quota: true,
          price: true,
          program: { select: { title: true } }
        }
      },
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          amount: true,
          status: true,
          paymentProofUrl: true,
          paidAt: true
        }
      }
    }
  });

  return enrollments.map(e => ({
    id: e.id,
    createdAt: e.createdAt.toISOString(),
    assessmentStatus: e.assessmentStatus,
    user: {
      id: e.user.id,
      fullName: e.user.fullName,
      email: e.user.email,
      phone: e.user.phone ?? ""
    },
    batch: {
      id: e.batch.id,
      startDate: e.batch.startDate.toISOString(),
      endDate: e.batch.endDate.toISOString(),
      price: e.batch.price
    },
    invoice: e.invoice ? {
      id: e.invoice.id,
      invoiceNumber: e.invoice.invoiceNumber,
      amount: e.invoice.amount,
      status: e.invoice.status,
      paymentProofUrl: e.invoice.paymentProofUrl,
      paidAt: e.invoice.paidAt?.toISOString() ?? null
    } : null,
    docCount: Array.isArray(e.user.participantDocuments)
      ? (e.user.participantDocuments as ParticipantDocumentRecord[]).length
      : 0
  }));
}

function waLink(phone: string, name: string) {
  const num = phone.replace(/\D/g, "").replace(/^0/, "62");
  const msg = encodeURIComponent(`Halo ${name}, kami dari Arkama Jaya Sertifikasi. Terkait pendaftaran pelatihan POP Anda...`);
  return `https://wa.me/${num}?text=${msg}`;
}

export default async function AdminPOPPage() {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || !canAccessAdminPortal(currentUser.role)) redirect("/masuk");

  const enrollments = await getPOPEnrollments();

  // Stats
  const total = enrollments.length;
  const paid = enrollments.filter(e => e.invoice?.status === "PAID").length;
  const pendingVerif = enrollments.filter(e => e.invoice?.status === "PENDING_VERIFICATION").length;
  const unpaid = enrollments.filter(e => !e.invoice || e.invoice.status === "UNPAID").length;
  const docComplete = enrollments.filter(e => e.docCount >= 5).length;

  // Group by batch
  const byBatch = new Map<string, typeof enrollments>();
  for (const e of enrollments) {
    const key = e.batch.id;
    if (!byBatch.has(key)) byBatch.set(key, []);
    byBatch.get(key)!.push(e);
  }

  return (
    <div style={{ display: "grid", gap: "32px" }}>

      {/* Header */}
      <section className="britsafe-card" style={{ padding: "32px", borderTop: "4px solid var(--ajs-orange)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="britsafe-card__category">Manajemen Pelatihan</span>
            <h1 className="britsafe-card__title" style={{ fontSize: "24px", marginTop: "8px", marginBottom: "6px" }}>
              Pengawas Operasional Pertama (POP)
            </h1>
            <p style={{ fontSize: "14px", color: "var(--ajs-muted)", margin: 0 }}>
              Monitor pendaftar, status pembayaran, dan kelengkapan dokumen.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/pelatihan/pop/daftar"
              target="_blank"
              style={{ fontSize: "13px", padding: "8px 16px", border: "1px solid var(--ajs-border)", borderRadius: "8px", textDecoration: "none", color: "var(--ajs-navy)", fontWeight: "600" }}
            >
              Lihat Halaman Daftar →
            </Link>
            <Link
              href="/admin/verifikasi-pembayaran"
              style={{ fontSize: "13px", padding: "8px 16px", background: "var(--ajs-navy)", borderRadius: "8px", textDecoration: "none", color: "white", fontWeight: "600" }}
            >
              Verifikasi Pembayaran
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Pendaftar", value: total, color: "var(--ajs-navy)" },
          { label: "Sudah Lunas", value: paid, color: "var(--ajs-green)" },
          { label: "Menunggu Verifikasi", value: pendingVerif, color: "#f57c00" },
          { label: "Belum Bayar", value: unpaid, color: "var(--ajs-red)" },
          { label: "Dokumen Lengkap", value: docComplete, color: "var(--ajs-green)" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "white", border: "1px solid var(--ajs-border)", borderRadius: "10px", padding: "20px" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "var(--ajs-muted)", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Panduan Admin */}
      <section style={{ background: "white", border: "1px solid var(--ajs-border)", borderRadius: "12px", padding: "28px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--ajs-navy)", margin: "0 0 20px" }}>
          📋 Alur Kerja Admin
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { num: 1, title: "Peserta Mendaftar", desc: "Sistem otomatis membuat akun dan invoice. Peserta diarahkan ke halaman checkout." },
            { num: 2, title: "Verifikasi Pembayaran", desc: "Peserta upload bukti transfer. Admin verifikasi di menu \"Verifikasi Pembayaran\"." },
            { num: 3, title: "Cek Kelengkapan Dokumen", desc: "Setelah lunas, peserta upload dokumen di Dashboard Peserta mereka." },
            { num: 4, title: "Konfirmasi & Persiapan", desc: "Hubungi peserta via WA untuk konfirmasi keikutsertaan dan info teknis pelatihan." },
            { num: 5, title: "Buka QR Presensi", desc: "Pada hari H, buka Docking QR di halaman sesi untuk presensi foto peserta." },
          ].map(step => (
            <div key={step.num} style={{ display: "flex", gap: "12px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--ajs-navy)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ajs-navy)", marginBottom: "2px" }}>{step.title}</div>
                <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enrollments grouped by batch */}
      {enrollments.length === 0 ? (
        <div style={{ background: "white", border: "1px solid var(--ajs-border)", borderRadius: "12px", padding: "40px", textAlign: "center", color: "var(--ajs-muted)" }}>
          Belum ada peserta yang mendaftar untuk program POP.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {Array.from(byBatch.entries()).map(([batchId, batchEnrollments]) => {
            const first = batchEnrollments[0];
            return (
              <section key={batchId} style={{ background: "white", border: "1px solid var(--ajs-border)", borderRadius: "12px", overflow: "hidden" }}>
                {/* Batch header */}
                <div style={{ padding: "16px 20px", background: "var(--ajs-gray)", borderBottom: "1px solid var(--ajs-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ajs-navy)" }}>
                      Batch: {formatDateRange(new Date(first.batch.startDate), new Date(first.batch.endDate))}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--ajs-muted)", marginTop: "2px" }}>
                      {batchEnrollments.length} peserta · {first.batch.price ? formatCurrency(first.batch.price) : "Gratis"}
                    </div>
                  </div>
                  <Link
                    href={`/admin/buat-program#sessions`}
                    style={{ fontSize: "12px", fontWeight: "600", color: "var(--ajs-orange)", textDecoration: "none" }}
                  >
                    Kelola Sesi →
                  </Link>
                </div>

                {/* Participant rows */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--ajs-border)" }}>
                        {["Peserta", "Kontak", "Invoice", "Dokumen", "Status", "Aksi"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "var(--ajs-muted)", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {batchEnrollments.map((enr, i) => {
                        const invStatus = enr.invoice?.status ?? "UNPAID";
                        const badge = invoiceStatusLabel[invStatus] ?? invoiceStatusLabel.UNPAID;
                        return (
                          <tr key={enr.id} style={{ borderBottom: i < batchEnrollments.length - 1 ? "1px solid var(--ajs-border)" : "none" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: "700", color: "var(--ajs-navy)" }}>{enr.user.fullName}</div>
                              <div style={{ fontSize: "11px", color: "var(--ajs-muted)", marginTop: "2px" }}>{enr.user.email}</div>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              {enr.user.phone ? (
                                <a
                                  href={waLink(enr.user.phone, enr.user.fullName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#25D366", fontWeight: "700", textDecoration: "none", fontSize: "12px" }}
                                >
                                  WA: {enr.user.phone}
                                </a>
                              ) : (
                                <span style={{ color: "var(--ajs-muted)", fontSize: "12px" }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              {enr.invoice ? (
                                <div>
                                  <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", color: badge.color, background: badge.bg }}>
                                    {badge.label}
                                  </span>
                                  <div style={{ fontSize: "11px", color: "var(--ajs-muted)", marginTop: "4px" }}>
                                    {formatCurrency(enr.invoice.amount)}
                                  </div>
                                  {enr.invoice.paymentProofUrl && (
                                    <a href={enr.invoice.paymentProofUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--ajs-orange)", textDecoration: "underline" }}>
                                      Lihat Bukti
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--ajs-muted)" }}>Tidak ada invoice</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "700",
                                color: enr.docCount >= 5 ? "var(--ajs-green)" : enr.docCount > 0 ? "#f57c00" : "var(--ajs-red)",
                                background: enr.docCount >= 5 ? "rgba(0,166,81,0.1)" : enr.docCount > 0 ? "rgba(245,124,0,0.1)" : "rgba(227,30,36,0.08)"
                              }}>
                                {enr.docCount}/5 Dokumen
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ fontSize: "11px", padding: "3px 8px", background: "var(--ajs-gray)", borderRadius: "4px", fontWeight: "600", color: "var(--ajs-text)" }}>
                                {enr.assessmentStatus}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {enr.user.phone && (
                                  <a
                                    href={waLink(enr.user.phone, enr.user.fullName)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", background: "#25D366", color: "white", borderRadius: "4px", textDecoration: "none" }}
                                  >
                                    WA
                                  </a>
                                )}
                                {enr.invoice?.status === "PENDING_VERIFICATION" && (
                                  <Link
                                    href="/admin/verifikasi-pembayaran"
                                    style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", background: "var(--ajs-orange)", color: "white", borderRadius: "4px", textDecoration: "none" }}
                                  >
                                    Verifikasi
                                  </Link>
                                )}
                                <Link
                                  href="/admin/peserta"
                                  style={{ fontSize: "11px", fontWeight: "600", padding: "4px 10px", border: "1px solid var(--ajs-border)", borderRadius: "4px", textDecoration: "none", color: "var(--ajs-navy)" }}
                                >
                                  Detail
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
