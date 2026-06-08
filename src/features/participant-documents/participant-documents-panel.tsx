"use client";

import { useState, useRef } from "react";

import type { ParticipantDocumentRecord, ParticipantDocumentType } from "@/features/participant-documents/participant-document.types";
import { participantDocumentTypeLabels } from "@/features/participant-documents/participant-document.types";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type DocumentsApiResponse = {
  data?: {
    documents: ParticipantDocumentRecord[];
  };
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateLabel(rawValue: string | null) {
  if (!rawValue) return "Tidak ada masa berlaku";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(rawValue));
}

const requiredDocs: { type: ParticipantDocumentType; label: string; hint: string }[] = [
  { type: "KTP",        label: "KTP / Identitas Diri",          hint: "Kartu Tanda Penduduk yang masih berlaku" },
  { type: "CV",         label: "CV (Curriculum Vitae)",          hint: "Riwayat hidup lengkap" },
  { type: "PAS_FOTO",   label: "Pas Foto Background Merah",      hint: "Ukuran 3×4 atau 4×6, background merah" },
  { type: "IJAZAH",     label: "Ijazah Terakhir",                hint: "SMA / D3 / S1 atau sederajat" },
  { type: "SURAT_KERJA",label: "Surat Pengalaman Kerja / Paklaring", hint: "Dari perusahaan tempat bekerja" },
];

export function ParticipantDocumentsPanel({
  initialDocuments
}: {
  initialDocuments: ParticipantDocumentRecord[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleUploadAll(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const entries = requiredDocs
      .map((doc) => ({ doc, file: fileRefs.current[doc.type]?.files?.[0] }))
      .filter((e) => e.file);

    if (entries.length === 0) {
      setNotification({ type: "error", message: "Pilih minimal satu dokumen untuk diunggah." });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    let lastDocuments = documents;
    let successCount = 0;

    for (const { doc, file } of entries) {
      setProgress(`Mengunggah ${doc.label}...`);
      try {
        const formData = new FormData();
        formData.append("type", doc.type);
        formData.append("file", file!);

        const response = await fetch("/api/participant-documents", { method: "POST", body: formData });
        const payload = (await response.json()) as ApiErrorResponse & DocumentsApiResponse;

        if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Gagal upload.");
        lastDocuments = payload.data.documents;
        successCount++;
      } catch {
        // lanjut ke dokumen berikutnya
      }
    }

    setDocuments(lastDocuments);
    setProgress(null);
    setIsSubmitting(false);

    // reset semua file input
    requiredDocs.forEach((doc) => {
      if (fileRefs.current[doc.type]) fileRefs.current[doc.type]!.value = "";
    });

    setNotification({
      type: "success",
      message: `${successCount} dokumen berhasil diunggah dan siap dipakai untuk pendaftaran.`,
    });
  }

  return (
    <section id="dokumen-saya" className="britsafe-card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div>
          <h2 className="britsafe-card__title" style={{ fontSize: "20px", marginBottom: "8px" }}>
            Dokumen Saya
          </h2>
          <p style={{ margin: 0, color: "var(--ajs-muted)", fontSize: "14px" }}>
            Lengkapi semua dokumen di bawah, lalu klik <strong>Upload Semua Dokumen</strong>.
          </p>
        </div>
        <div style={{ padding: "10px 16px", borderRadius: "var(--radius-sm)", background: "rgba(244,121,32,0.08)", color: "var(--ajs-navy)", fontSize: "13px", fontWeight: 700 }}>
          Tersimpan: {documents.length} dokumen
        </div>
      </div>

      {notification && (
        <div style={{
          marginBottom: "20px", padding: "12px 16px", borderRadius: "var(--radius-sm)",
          background: notification.type === "success" ? "rgba(0,166,81,0.12)" : "rgba(227,30,36,0.12)",
          color: notification.type === "success" ? "var(--ajs-green)" : "var(--ajs-red)",
          fontSize: "13px", fontWeight: 700
        }}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleUploadAll}>
        <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
          {requiredDocs.map((doc) => {
            const uploaded = documents.find((d) => d.type === doc.type);
            return (
              <div key={doc.type} style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                borderRadius: "8px",
                border: `1px solid ${uploaded ? "rgba(0,166,81,0.3)" : "var(--ajs-border)"}`,
                background: uploaded ? "rgba(0,166,81,0.04)" : "rgba(249,250,251,0.85)",
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    {uploaded && (
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#00A651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--ajs-navy)" }}>
                      {doc.label}
                    </span>
                    {uploaded && (
                      <span style={{ fontSize: "11px", color: "var(--ajs-green)", fontWeight: 600 }}>
                        Sudah ada
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--ajs-muted)" }}>{doc.hint}</p>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    ref={(el) => { fileRefs.current[doc.type] = el; }}
                    style={{ fontSize: "13px", color: "var(--ajs-navy)" }}
                    disabled={isSubmitting}
                  />
                </div>
                <div style={{ fontSize: "11px", color: "var(--ajs-muted)", textAlign: "right", whiteSpace: "nowrap" }}>
                  {uploaded ? `✓ ${uploaded.fileName}` : "Belum diupload"}
                </div>
              </div>
            );
          })}
        </div>

        {progress && (
          <div style={{ marginBottom: "12px", fontSize: "13px", color: "var(--ajs-muted)", fontStyle: "italic" }}>
            {progress}
          </div>
        )}

        <button type="submit" className="cta-primary" disabled={isSubmitting} style={{ width: "100%" }}>
          {isSubmitting ? progress ?? "Mengunggah..." : "Upload Semua Dokumen"}
        </button>
      </form>


      {documents.length === 0 ? (
        <div
          style={{
            padding: "18px",
            borderRadius: "var(--radius-sm)",
            border: "1px dashed var(--ajs-border)",
            color: "var(--ajs-muted)",
            fontSize: "14px"
          }}
        >
          Belum ada dokumen yang tersimpan. Unggah KTP, pas foto, ijazah, atau dokumen syarat lain agar pendaftaran batch berikutnya lebih cepat.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {documents.map((document) => (
            <article
              key={document.id}
              style={{
                border: "1px solid var(--ajs-border)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                display: "grid",
                gap: "12px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "14px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <strong style={{ display: "block", color: "var(--ajs-navy)", marginBottom: "4px" }}>
                    {document.customLabel ?? participantDocumentTypeLabels[document.type]}
                  </strong>
                  <div style={{ fontSize: "13px", color: "var(--ajs-muted)" }}>
                    {participantDocumentTypeLabels[document.type]} • {document.fileName}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={deletingId === document.id}
                  style={{ color: "var(--ajs-red)", borderColor: "rgba(227,30,36,0.24)" }}
                  onClick={async () => {
                    setDeletingId(document.id);
                    setNotification(null);

                    try {
                      const response = await fetch(
                        `/api/participant-documents/${document.id}`,
                        {
                          method: "DELETE"
                        }
                      );
                      const payload = (await response.json()) as ApiErrorResponse & DocumentsApiResponse;

                      if (!response.ok || !payload.data) {
                        throw new Error(payload.error?.message ?? "Gagal menghapus dokumen peserta.");
                      }

                      setDocuments(payload.data.documents);
                      setNotification({
                        type: "success",
                        message: "Dokumen peserta berhasil dihapus."
                      });
                    } catch (error) {
                      setNotification({
                        type: "error",
                        message:
                          error instanceof Error
                            ? error.message
                            : "Terjadi kesalahan saat menghapus dokumen."
                      });
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  {deletingId === document.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "10px",
                  fontSize: "13px",
                  color: "var(--ajs-muted)"
                }}
              >
                <div>Ukuran: {formatFileSize(document.sizeBytes)}</div>
                <div>Diunggah: {formatDateLabel(document.uploadedAt)}</div>
                <div>Berlaku sampai: {formatDateLabel(document.expiryDate)}</div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ color: "var(--ajs-navy)", borderColor: "var(--ajs-border)" }}
                >
                  Lihat Dokumen
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
