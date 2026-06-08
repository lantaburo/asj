"use client";

import { useState } from "react";
import type { ParticipantDocumentRecord } from "@/features/participant-documents/participant-document.types";

type Participant = {
  userId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  documents: ParticipantDocumentRecord[];
  assessmentStatus?: string;
};

type GlobalParticipant = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  documents: ParticipantDocumentRecord[];
  enrollments: {
    id: string;
    programTitle: string;
    startDate: string;
    endDate: string;
    assessmentStatus: string;
  }[];
};

type BatchData = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  participants: Participant[];
};

type ProgramData = {
  id: string;
  title: string;
  batches: BatchData[];
};

const DOC_TYPE_COLORS: Record<string, string> = {
  KTP: "#1b365d",
  CV: "#4a6fa5",
  PAS_FOTO: "#ea7319",
  IJAZAH: "#00a651",
  SURAT_KERJA: "#6b7280",
  SERTIFIKAT: "#8b5cf6",
  LAINNYA: "#9ca3af",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    KOMPETEN: { bg: "rgba(0,166,81,0.1)", color: "#00a651", label: "Kompeten" },
    BELUM_KOMPETEN: { bg: "rgba(227,30,36,0.1)", color: "#e31e24", label: "Belum Kompeten" },
    PENDING: { bg: "rgba(234,115,25,0.1)", color: "#ea7319", label: "Pending" },
  };
  const s = map[status] ?? { bg: "rgba(0,0,0,0.06)", color: "#6b7280", label: status };
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function DocumentBadge({ doc, label }: { doc: ParticipantDocumentRecord; label: string }) {
  return (
    <a
      href={doc.fileUrl}
      target="_blank"
      rel="noreferrer"
      title={`Lihat ${label}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700,
        textDecoration: "none", color: "white",
        background: DOC_TYPE_COLORS[doc.type] ?? "#6b7280",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      {label}
    </a>
  );
}

function ParticipantRow({ p, labels, showPrograms }: {
  p: Participant | GlobalParticipant;
  labels: Record<string, string>;
  showPrograms?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isGlobal = "enrollments" in p;

  return (
    <div style={{ border: "1px solid var(--ajs-border)", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center", gap: "12px",
          padding: "12px 16px", textAlign: "left",
        }}
      >
        <div>
          <strong style={{ fontSize: "14px", color: "var(--ajs-navy)", display: "block" }}>{p.fullName}</strong>
          <span style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
            {p.email ?? p.phone ?? "—"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {p.documents.length === 0 ? (
            <span style={{ fontSize: "11px", color: "#e31e24", fontWeight: 600 }}>Belum ada dokumen</span>
          ) : (
            <span style={{ fontSize: "11px", color: "#00a651", fontWeight: 600 }}>{p.documents.length} dokumen</span>
          )}
          {"assessmentStatus" in p && p.assessmentStatus && statusBadge(p.assessmentStatus as string)}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ajs-muted)" strokeWidth="2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--ajs-border)", padding: "16px", background: "rgba(249,250,251,0.8)" }}>
          {showPrograms && isGlobal && (p as GlobalParticipant).enrollments.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--ajs-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Program Terdaftar</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(p as GlobalParticipant).enrollments.map((e) => (
                  <span key={e.id} style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "12px", background: "rgba(27,54,93,0.08)", color: "var(--ajs-navy)", fontWeight: 600 }}>
                    {e.programTitle} · {formatDate(e.startDate)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--ajs-muted)", textTransform: "uppercase", marginBottom: "10px" }}>Dokumen</p>

          {p.documents.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--ajs-muted)", fontStyle: "italic" }}>Peserta belum mengupload dokumen apapun.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {p.documents.map((doc) => (
                <DocumentBadge key={doc.id} doc={doc} label={doc.customLabel ?? labels[doc.type] ?? doc.type} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PesertaAdminClient({
  allParticipants,
  programsWithBatches,
  documentTypeLabels,
}: {
  allParticipants: GlobalParticipant[];
  programsWithBatches: ProgramData[];
  documentTypeLabels: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState<"global" | "program">("global");
  const [search, setSearch] = useState("");
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const filtered = allParticipants.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q)
    );
  });

  const totalDocs = allParticipants.reduce((s, p) => s + p.documents.length, 0);
  const withDocs = allParticipants.filter((p) => p.documents.length > 0).length;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Header */}
      <section className="britsafe-card" style={{ padding: "32px", borderTop: "4px solid var(--ajs-orange)" }}>
        <span className="britsafe-card__category">Manajemen Peserta</span>
        <h1 className="britsafe-card__title" style={{ fontSize: "26px", margin: "10px 0 8px" }}>
          Daftar Peserta & Dokumen
        </h1>
        <p className="britsafe-card__copy" style={{ margin: "0 0 24px" }}>
          Pantau seluruh peserta terdaftar beserta kelengkapan dokumen persyaratan mereka.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Total Peserta", value: allParticipants.length },
            { label: "Sudah Upload Dok.", value: withDocs },
            { label: "Belum Upload", value: allParticipants.length - withDocs },
            { label: "Total Dokumen", value: totalDocs },
          ].map((s) => (
            <div key={s.label} style={{ padding: "12px 20px", borderRadius: "8px", background: "var(--ajs-gray)", minWidth: "120px" }}>
              <strong style={{ display: "block", fontSize: "24px", color: "var(--ajs-orange)" }}>{s.value}</strong>
              <span style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid var(--ajs-border)", paddingBottom: "0" }}>
        {([["global", "Semua Peserta"], ["program", "Per Program / Batch"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: "10px 20px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px",
              background: "none", borderBottom: activeTab === key ? "3px solid var(--ajs-orange)" : "3px solid transparent",
              color: activeTab === key ? "var(--ajs-orange)" : "var(--ajs-muted)",
              marginBottom: "-2px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Global tab */}
      {activeTab === "global" && (
        <section className="britsafe-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="text-input"
              style={{ maxWidth: "320px", margin: 0 }}
              placeholder="Cari nama, email, atau nomor HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span style={{ fontSize: "13px", color: "var(--ajs-muted)" }}>{filtered.length} peserta ditemukan</span>
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: "var(--ajs-muted)", fontSize: "14px" }}>Tidak ada peserta ditemukan.</p>
          ) : (
            filtered.map((p) => (
              <ParticipantRow
                key={p.id}
                p={{ ...p, userId: p.id }}
                labels={documentTypeLabels}
                showPrograms
              />
            ))
          )}
        </section>
      )}

      {/* Per program/batch tab */}
      {activeTab === "program" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {programsWithBatches.length === 0 && (
            <p style={{ color: "var(--ajs-muted)" }}>Belum ada program aktif.</p>
          )}
          {programsWithBatches.map((program) => (
            <section key={program.id} className="britsafe-card" style={{ padding: "0", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--ajs-border)", background: "rgba(27,54,93,0.03)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--ajs-navy)", margin: 0 }}>
                  {program.title}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                  {program.batches.reduce((s, b) => s + b.participants.length, 0)} peserta di {program.batches.length} batch
                </span>
              </div>

              <div style={{ padding: "16px 24px", display: "grid", gap: "12px" }}>
                {program.batches.map((batch) => {
                  const isOpen = expandedBatch === batch.id;
                  return (
                    <div key={batch.id} style={{ border: "1px solid var(--ajs-border)", borderRadius: "8px", overflow: "hidden" }}>
                      <button
                        onClick={() => setExpandedBatch(isOpen ? null : batch.id)}
                        style={{
                          width: "100%", background: isOpen ? "rgba(234,115,25,0.05)" : "white",
                          border: "none", cursor: "pointer", padding: "12px 16px",
                          display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <strong style={{ fontSize: "13px", color: "var(--ajs-navy)" }}>
                            Batch {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
                          </strong>
                          <span style={{ display: "block", fontSize: "12px", color: "var(--ajs-muted)" }}>
                            {batch.participants.length} peserta · {batch.status}
                          </span>
                        </div>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ajs-muted)" strokeWidth="2"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--ajs-border)", background: "rgba(249,250,251,0.6)" }}>
                          {batch.participants.length === 0 ? (
                            <p style={{ fontSize: "13px", color: "var(--ajs-muted)", margin: 0 }}>Belum ada peserta terdaftar di batch ini.</p>
                          ) : (
                            batch.participants.map((p) => (
                              <ParticipantRow key={p.enrollmentId} p={p} labels={documentTypeLabels} />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
