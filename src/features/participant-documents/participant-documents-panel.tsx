"use client";

import { useState } from "react";

import type { ParticipantDocumentRecord } from "@/features/participant-documents/participant-document.types";
import {
  participantDocumentTypeLabels,
  participantDocumentTypeOptions
} from "@/features/participant-documents/participant-document.types";

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
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateLabel(rawValue: string | null) {
  if (!rawValue) {
    return "Tidak ada masa berlaku";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(rawValue));
}

export function ParticipantDocumentsPanel({
  initialDocuments
}: {
  initialDocuments: ParticipantDocumentRecord[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  return (
    <section className="britsafe-card" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "18px"
        }}
      >
        <div>
          <h2 className="britsafe-card__title" style={{ fontSize: "20px", marginBottom: "10px" }}>
            Dokumen Saya
          </h2>
          <p style={{ margin: 0, color: "var(--ajs-muted)", fontSize: "14px" }}>
            Unggah sekali di sini. Saat Anda daftar batch baru, sistem akan memakai snapshot dokumen ini secara otomatis.
          </p>
        </div>

        <div
          style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(244, 121, 32, 0.08)",
            color: "var(--ajs-navy)",
            fontSize: "13px",
            fontWeight: 700
          }}
        >
          Tersimpan: {documents.length} dokumen
        </div>
      </div>

      {notification ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            background:
              notification.type === "success"
                ? "rgba(0, 166, 81, 0.12)"
                : "rgba(227, 30, 36, 0.12)",
            color:
              notification.type === "success"
                ? "var(--ajs-green)"
                : "var(--ajs-red)",
            fontSize: "13px",
            fontWeight: 700
          }}
        >
          {notification.message}
        </div>
      ) : null}

      <form
        className="britsafe-card"
        style={{
          padding: "18px",
          marginBottom: "18px",
          background: "rgba(249, 250, 251, 0.85)",
          border: "1px solid var(--ajs-border)"
        }}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setNotification(null);

          try {
            const formData = new FormData(event.currentTarget);
            const response = await fetch("/api/participant-documents", {
              method: "POST",
              body: formData
            });

            const payload = (await response.json()) as ApiErrorResponse & DocumentsApiResponse;

            if (!response.ok || !payload.data) {
              throw new Error(payload.error?.message ?? "Upload dokumen peserta gagal.");
            }

            setDocuments(payload.data.documents);
            event.currentTarget.reset();
            setNotification({
              type: "success",
              message: "Dokumen peserta berhasil disimpan dan siap dipakai untuk pendaftaran berikutnya."
            });
          } catch (error) {
            setNotification({
              type: "error",
              message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah dokumen."
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px"
          }}
        >
          <label className="field-group" style={{ margin: 0 }}>
            <span className="field-label">Tipe Dokumen</span>
            <select className="text-input" name="type" required defaultValue="KTP">
              {participantDocumentTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {participantDocumentTypeLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group" style={{ margin: 0 }}>
            <span className="field-label">Label Tambahan</span>
            <input
              className="text-input"
              type="text"
              name="customLabel"
              placeholder="Contoh: KTP terbaru / Sertifikat AK3U"
            />
          </label>

          <label className="field-group" style={{ margin: 0 }}>
            <span className="field-label">Masa Berlaku</span>
            <input className="text-input" type="date" name="expiryDate" />
          </label>
        </div>

        <label className="field-group" style={{ marginTop: "14px", marginBottom: 0 }}>
          <span className="field-label">File Dokumen</span>
          <input
            className="text-input"
            style={{ paddingTop: "14px" }}
            type="file"
            name="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            required
          />
          <span className="field-helper">
            Format yang didukung: PDF, JPG, PNG, WEBP. Maksimal 8 MB per file.
          </span>
        </label>

        <button
          type="submit"
          className="cta-primary"
          disabled={isSubmitting}
          style={{ marginTop: "14px" }}
        >
          {isSubmitting ? "Menyimpan Dokumen..." : "Simpan Dokumen ke Akun Saya"}
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
