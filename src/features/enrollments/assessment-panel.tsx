"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EnrollmentItem = {
  id: string;
  assessmentStatus: string;
  certificateNum: string | null;
  expiryDate: string | null;
  qrVerifyCode: string;
  user: { id: string; fullName: string; email: string };
  batch: { 
    program: { title: string }; 
    startDate: string; 
    endDate: string;
    instructor: { fullName: string } | null;
    assessor: { fullName: string } | null;
  };
  k3LogCount: number;
};

type K3Log = {
  id: string;
  activityName: string;
  safetyScore: number | null;
  enrollment: {
    id: string;
  };
  verifiedBy: { fullName: string } | null;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Menunggu Penilaian", color: "#6B7280" },
  { value: "KOMPETEN", label: "Kompeten ✓", color: "#059669" },
  { value: "BELUM_KOMPETEN", label: "Belum Kompeten", color: "#DC2626" },
];

export function AssessmentPanel({ enrollments, logs }: { enrollments: EnrollmentItem[], logs: K3Log[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [logLoadingId, setLogLoadingId] = useState<string | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAssessmentUpdate = async (enrollmentId: string, assessmentStatus: string) => {
    setLoadingId(enrollmentId);
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/assessment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal memperbarui assessment.");
      showNotification("success", `Status peserta berhasil diubah menjadi "${assessmentStatus}".`);
      router.refresh();
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleVerifyLog = async (logId: string) => {
    setLogLoadingId(logId);
    try {
      const res = await fetch(`/api/k3-logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal verifikasi log.");
      showNotification("success", "Log K3 berhasil diverifikasi.");
      router.refresh();
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLogLoadingId(null);
    }
  };

  const statusMeta = (status: string) =>
    STATUS_OPTIONS.find(s => s.value === status) ?? { label: status, color: "#6B7280" };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 1000,
          padding: "16px 20px", borderRadius: "var(--radius-sm)",
          background: notification.type === "success" ? "rgba(5,150,105,0.95)" : "rgba(220,38,38,0.95)",
          color: "white", fontWeight: "700", fontSize: "14px",
          boxShadow: "var(--shadow-lg)", backdropFilter: "blur(4px)",
          animation: "slideIn 0.3s ease"
        }}>
          {notification.type === "success" ? "✓ " : "✕ "}{notification.message}
        </div>
      )}

      {/* Enrollment Cards */}
      {enrollments.map((enrollment) => {
        const status = statusMeta(enrollment.assessmentStatus);
        const isExpanded = expandedId === enrollment.id;
        const isLoading = loadingId === enrollment.id;
        const relatedLogs = logs.filter((log) => log.enrollment.id === enrollment.id);

        return (
          <article key={enrollment.id} className="britsafe-card" style={{ padding: "0", overflow: "hidden" }}>
            {/* Header Row */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 24px", cursor: "pointer",
              borderBottom: isExpanded ? "1px solid var(--ajs-border)" : "none"
            }} onClick={() => setExpandedId(isExpanded ? null : enrollment.id)}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "var(--ajs-gray)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: "700", fontSize: "16px", color: "var(--ajs-navy)"
                }}>
                  {enrollment.user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: "700", color: "var(--ajs-navy)", fontSize: "15px" }}>
                    {enrollment.user.fullName}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                    {enrollment.user.email} • {enrollment.batch.program.title}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{
                  fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px",
                  background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}40`
                }}>
                  {status.label}
                </span>
                <span style={{ color: "var(--ajs-muted)", fontSize: "18px" }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded Detail */}
            {isExpanded && (
              <div style={{ padding: "24px", display: "grid", gap: "24px" }}>
                {/* Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <div style={{ background: "var(--ajs-gray)", padding: "14px", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "11px", color: "var(--ajs-muted)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Log K3 Masuk</div>
                    <strong style={{ fontSize: "22px", color: "var(--ajs-navy)" }}>{enrollment.k3LogCount}</strong>
                  </div>
                  <div style={{ background: "var(--ajs-gray)", padding: "14px", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "11px", color: "var(--ajs-muted)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>No. Sertifikat</div>
                    <strong style={{ fontSize: "13px", color: "var(--ajs-navy)", wordBreak: "break-all" }}>
                      {enrollment.certificateNum ?? "Belum diterbitkan"}
                    </strong>
                  </div>
                  <div style={{ background: "var(--ajs-gray)", padding: "14px", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "11px", color: "var(--ajs-muted)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Tenaga Ahli</div>
                    <div style={{ fontSize: "12px", color: "var(--ajs-navy)" }}>
                      Instruktur: <strong>{enrollment.batch.instructor?.fullName ?? "-"}</strong><br/>
                      Asesor: <strong>{enrollment.batch.assessor?.fullName ?? "-"}</strong>
                    </div>
                  </div>
                </div>

                {/* K3 Logs related to this enrollment */}
                {relatedLogs.length > 0 && (
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ajs-navy)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Logbook K3 Peserta
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {relatedLogs.map(log => (
                        <div key={log.id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "12px 16px", border: "1px solid var(--ajs-border)", borderRadius: "var(--radius-sm)"
                        }}>
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--ajs-navy)" }}>{log.activityName}</div>
                            <div style={{ fontSize: "12px", color: "var(--ajs-muted)", marginTop: "2px" }}>
                              Safety Score: <strong>{log.safetyScore ?? "Belum dinilai"}</strong>
                              {log.verifiedBy && ` • Verifikator: ${log.verifiedBy.fullName}`}
                            </div>
                          </div>
                          {!log.verifiedBy && (
                            <button
                              disabled={logLoadingId === log.id}
                              onClick={() => handleVerifyLog(log.id)}
                              style={{
                                background: "rgba(5,150,105,0.1)", color: "#059669",
                                border: "1px solid rgba(5,150,105,0.3)", padding: "6px 14px",
                                borderRadius: "var(--radius-sm)", fontWeight: "700", fontSize: "12px",
                                cursor: "pointer", whiteSpace: "nowrap"
                              }}>
                              {logLoadingId === log.id ? "..." : "Verifikasi Log"}
                            </button>
                          )}
                          {log.verifiedBy && (
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#059669" }}>✓ Terverifikasi</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assessment Action */}
                <div style={{ borderTop: "1px solid var(--ajs-border)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ajs-navy)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Ubah Status Kompetensi
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        disabled={isLoading || enrollment.assessmentStatus === opt.value}
                        onClick={() => handleAssessmentUpdate(enrollment.id, opt.value)}
                        style={{
                          padding: "12px 16px", borderRadius: "var(--radius-sm)",
                          border: enrollment.assessmentStatus === opt.value
                            ? `2px solid ${opt.color}` : "1px solid var(--ajs-border)",
                          background: enrollment.assessmentStatus === opt.value
                            ? `${opt.color}18` : "white",
                          color: opt.color, fontWeight: "700", fontSize: "13px",
                          cursor: enrollment.assessmentStatus === opt.value ? "default" : "pointer",
                          opacity: isLoading ? 0.6 : 1, transition: "all 0.2s"
                        }}>
                        {isLoading && enrollment.assessmentStatus !== opt.value ? "Menyimpan..." : opt.label}
                      </button>
                    ))}
                  </div>
                  {enrollment.assessmentStatus === "KOMPETEN" && enrollment.certificateNum && (
                    <div style={{
                      marginTop: "16px", background: "rgba(5,150,105,0.08)",
                      border: "1px solid rgba(5,150,105,0.2)", padding: "14px 16px",
                      borderRadius: "var(--radius-sm)", fontSize: "13px", color: "#059669"
                    }}>
                      ✓ Sertifikat telah diterbitkan: <strong>{enrollment.certificateNum}</strong><br />
                      <span style={{ fontSize: "12px" }}>QR Verifikasi: /verifikasi/{enrollment.qrVerifyCode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}

      {enrollments.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--ajs-muted)" }}>
          Belum ada data enrollment peserta.
        </div>
      )}
    </div>
  );
}
