"use client";

import { useState } from "react";
import { CrudActions } from "@/features/admin/crud-actions";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";

type ProgramStats = {
  id: string;
  title: string;
  category: string;
  industryType: string;
  isActive: boolean;
  batches: Array<{
    id: string;
    title?: string | null;
    startDate: string;
    endDate: string;
    quota: number;
    price: number | null;
    status: string;
    instructorName: string;
    enrollments: Array<{
      id: string;
      userName: string;
      userEmail: string;
      assessmentStatus: string;
      documentCount: number;
    }>;
    sessions: Array<{
      id: string;
      title: string;
      sessionDate: string;
      instructorName: string;
      attendanceCount: number;
    }>;
  }>;
};

type ClassroomOption = { id: string; roomName: string };
type InstructorOption = { id: string; fullName: string };

export function ProgramStatisticsTree({
  programs,
  classrooms = [],
  instructors = []
}: {
  programs: ProgramStats[];
  classrooms?: ClassroomOption[];
  instructors?: InstructorOption[];
}) {
  const [openPrograms, setOpenPrograms] = useState<Record<string, boolean>>({});
  const [openBatches, setOpenBatches] = useState<Record<string, boolean>>({});

  const toggleProgram = (id: string) => {
    setOpenPrograms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBatch = (id: string) => {
    setOpenBatches(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (programs.length === 0) {
    return <div style={{ padding: "24px", color: "var(--ajs-muted)" }}>Belum ada data program.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {programs.map((program) => (
        <div
          key={program.id}
          style={{
            border: "1px solid var(--ajs-border)",
            borderRadius: "var(--radius-sm)",
            background: "white",
            overflow: "hidden"
          }}
        >
          <div
            onClick={() => toggleProgram(program.id)}
            style={{
              padding: "16px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--ajs-gray)",
              fontWeight: "700",
              color: "var(--ajs-navy)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ transition: 'transform 0.2s', transform: openPrograms[program.id] ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '10px' }}>▶</span>
              <span style={{ fontSize: "18px" }}>{program.title}</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: program.isActive ? "rgba(0,166,81,0.1)" : "rgba(227,30,36,0.1)",
                  color: program.isActive ? "var(--ajs-green)" : "var(--ajs-red)"
                }}
              >
                {program.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--ajs-text)" }}>
              {program.batches.length} Batch
            </div>
          </div>
          
          {openPrograms[program.id] && (
            <div style={{ padding: "16px", animation: 'accordionFade 0.2s ease-out' }}>
              <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px dashed var(--ajs-border)" }}>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--ajs-muted)", marginBottom: "12px" }}>
                  <div>Kategori: <strong style={{ color: "var(--ajs-navy)" }}>{program.category}</strong></div>
                  <div>Industri: <strong style={{ color: "var(--ajs-navy)" }}>{program.industryType}</strong></div>
                </div>
                <CrudActions 
                  endpoint={`/api/programs/${program.id}`} 
                  itemName="Program" 
                  initialData={program}
                  editFields={[
                    { name: "title", label: "Judul Program", type: "text", required: true },
                    { name: "category", label: "Kategori", type: "select", options: [
                      { value: "KEPEMIMPINAN", label: "Kepemimpinan" },
                      { value: "TEKNIS", label: "Teknis" },
                      { value: "K3", label: "K3" },
                      { value: "SOFT_SKILL", label: "Soft Skill" },
                      { value: "LAINNYA", label: "Lainnya" }
                    ]},
                    { name: "industryType", label: "Tipe Industri", type: "text" },
                    { name: "isActive", label: "Status Aktif", type: "checkbox" }
                  ]}
                />
              </div>

              {program.batches.length === 0 ? (
                <div style={{ fontSize: "13px", color: "var(--ajs-muted)" }}>Belum ada batch untuk program ini.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingLeft: "16px", borderLeft: "2px solid var(--ajs-border)" }}>
                  {program.batches.map((batch) => (
                    <div key={batch.id} style={{ border: "1px solid var(--ajs-border)", borderRadius: "var(--radius-sm)", overflow: 'hidden' }}>
                      <div
                        onClick={() => toggleBatch(batch.id)}
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          background: "#fafafa",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "var(--ajs-navy)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ transition: 'transform 0.2s', transform: openBatches[batch.id] ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '8px' }}>▶</span>
                          <span style={{ color: "var(--ajs-orange)", fontSize: "12px", textTransform: "uppercase" }}>{batch.status}</span>
                          <span>| {batch.title ? `${batch.title} (${formatDateRange(new Date(batch.startDate), new Date(batch.endDate))})` : `Batch: ${formatDateRange(new Date(batch.startDate), new Date(batch.endDate))}`}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--ajs-text)", display: "flex", gap: "12px", alignItems: "center" }}>
                          <span>{batch.sessions.length} Session</span>
                          <span>{batch.enrollments.length}/{batch.quota} Peserta</span>
                          <a
                            href={`/admin/peserta?batchId=${batch.id}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontSize: "11px", fontWeight: 700, color: "var(--ajs-orange)", textDecoration: "none", padding: "2px 8px", border: "1px solid var(--ajs-orange)", borderRadius: "4px" }}
                          >
                            Peserta & Dokumen →
                          </a>
                        </div>
                      </div>

                      {openBatches[batch.id] && (
                        <div style={{ padding: "16px", background: "white", animation: 'accordionFade 0.2s ease-out' }}>
                          <div style={{ marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "var(--ajs-muted)", paddingBottom: "16px", borderBottom: "1px dashed var(--ajs-border)" }}>
                            <div>Instruktur Utama: <strong style={{ color: "var(--ajs-navy)" }}>{batch.instructorName}</strong></div>
                            <div>Harga Dasar: <strong style={{ color: "var(--ajs-navy)" }}>{formatCurrency(batch.price)}</strong></div>
                            <div style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
                              <CrudActions 
                                endpoint={`/api/batches/${batch.id}`} 
                                itemName="Batch" 
                                initialData={batch}
                                editFields={[
                                  { name: "title", label: "Nama Batch (Opsional)", type: "text" },
                                  { name: "startDate", label: "Tanggal Mulai", type: "datetime-local", required: true },
                                  { name: "endDate", label: "Tanggal Selesai", type: "datetime-local", required: true },
                                  { name: "classroomId", label: "Ruang Kelas", type: "select", options: [
                                    { value: "", label: "--- Menunggu Ruangan ---" },
                                    ...classrooms.map(c => ({ value: c.id, label: c.roomName }))
                                  ]},
                                  { name: "quota", label: "Kuota Peserta", type: "number", required: true },
                                  { name: "price", label: "Harga Dasar", type: "number" },
                                  { name: "status", label: "Status Batch", type: "select", options: [
                                    { value: "OPEN", label: "Open (Pendaftaran)" },
                                    { value: "ONGOING", label: "Ongoing (Berjalan)" },
                                    { value: "COMPLETED", label: "Completed (Selesai)" },
                                    { value: "CLOSED", label: "Closed (Ditutup)" }
                                  ]}
                                ]}
                              />
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            {/* Kolom Sessions */}
                            <div>
                              <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px", color: "var(--ajs-navy)" }}>Daftar Session</h4>
                              {batch.sessions.length === 0 ? (
                                <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>Belum ada session.</div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {batch.sessions.map((session) => (
                                    <div key={session.id} style={{ padding: "12px", background: "var(--ajs-gray)", borderRadius: "var(--radius-sm)", fontSize: "12px" }}>
                                      <div style={{ fontWeight: "700", marginBottom: "4px", color: "var(--ajs-navy)" }}>{session.title}</div>
                                      <div style={{ color: "var(--ajs-muted)", marginBottom: "4px" }}>{new Date(session.sessionDate).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "long" })} • {session.instructorName}</div>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ color: "var(--ajs-green)", fontWeight: "600" }}>{session.attendanceCount} hadir</span>
                                        <a 
                                          href={`/admin/sessions/${session.id}/docking`} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          style={{ 
                                            color: "var(--ajs-orange)", 
                                            fontWeight: "700", 
                                            textDecoration: "underline",
                                            fontSize: "11px"
                                          }}
                                        >
                                          Launch Docking (QR)
                                        </a>
                                      </div>
                                      <div style={{ marginTop: "8px" }}>
                                        <CrudActions
                                          endpoint={`/api/sessions/${session.id}`}
                                          itemName="Session"
                                          initialData={session}
                                          editFields={[
                                            { name: "title", label: "Judul Sesi", type: "text", required: true },
                                            { name: "sessionDate", label: "Tanggal Sesi", type: "datetime-local", required: true },
                                            { name: "startTime", label: "Waktu Mulai", type: "datetime-local", required: true },
                                            { name: "endTime", label: "Waktu Selesai", type: "datetime-local", required: true },
                                            ...(classrooms.length > 0 ? [{
                                              name: "classroomId",
                                              label: "Ruang Kelas",
                                              type: "select" as const,
                                              options: [
                                                { value: "", label: "— Pilih Ruang Kelas —" },
                                                ...classrooms.map(c => ({ value: c.id, label: c.roomName }))
                                              ]
                                            }] : []),
                                            ...(instructors.length > 0 ? [{
                                              name: "instructorId",
                                              label: "Instruktur",
                                              type: "select" as const,
                                              options: [
                                                { value: "", label: "— Pilih Instruktur —" },
                                                ...instructors.map(i => ({ value: i.id, label: i.fullName }))
                                              ]
                                            }] : [])
                                          ]}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Kolom Peserta (Enrollments) */}
                            <div>
                              <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px", color: "var(--ajs-navy)" }}>Daftar Peserta</h4>
                              {batch.enrollments.length === 0 ? (
                                <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>Belum ada peserta.</div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {batch.enrollments.map((enrollment, index) => (
                                    <div key={enrollment.id} style={{ padding: "8px 12px", border: "1px solid var(--ajs-border)", borderRadius: "4px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <div>
                                        <div style={{ fontWeight: "600", color: "var(--ajs-navy)" }}>{index + 1}. {enrollment.userName}</div>
                                        <div style={{ color: "var(--ajs-muted)", fontSize: "11px" }}>{enrollment.userEmail}</div>
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700",
                                          background: enrollment.documentCount > 0 ? "rgba(0,166,81,0.1)" : "rgba(227,30,36,0.1)",
                                          color: enrollment.documentCount > 0 ? "var(--ajs-green)" : "#e31e24"
                                        }}>
                                          {enrollment.documentCount > 0 ? `${enrollment.documentCount} dok` : "0 dok"}
                                        </span>
                                        <span style={{ fontSize: "10px", padding: "2px 6px", background: "var(--ajs-gray)", borderRadius: "4px", fontWeight: "700", color: enrollment.assessmentStatus === "KOMPETEN" ? "var(--ajs-green)" : "var(--ajs-text)" }}>
                                          {enrollment.assessmentStatus}
                                        </span>
                                        <CrudActions 
                                          endpoint={`/api/enrollments/${enrollment.id}`} 
                                          itemName="Status Peserta" 
                                          compact 
                                          initialData={{ assessmentStatus: enrollment.assessmentStatus }}
                                          editFields={[
                                            { name: "assessmentStatus", label: "Status Verifikasi", type: "select", options: [
                                              { value: "PENDING", label: "Pending" },
                                              { value: "KOMPETEN", label: "Kompeten" },
                                              { value: "BELUM_KOMPETEN", label: "Belum Kompeten" }
                                            ]}
                                          ]}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <style jsx>{`
        @keyframes accordionFade {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
