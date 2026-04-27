"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";

type UpcomingBatch = {
  id: string;
  startDate: string;
  endDate: string;
  quotaRemaining: number;
  price: number | null;
  programTitle: string;
  industryType: string;
};

export function RegisterForm({ batches }: { batches: UpcomingBatch[] }) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasOpenBatch = batches.some((batch) => batch.quotaRemaining > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasOpenBatch) {
      setError("Belum ada batch terbuka saat ini. Silakan cek kembali nanti.");
      return;
    }

    if (!selectedBatchId) {
      setError("Silakan pilih batch pelatihan terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Dapatkan magic link dummy sekaligus session peserta
      const authRes = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, fullName }),
      });

      const authData = await authRes.json();
      if (!authRes.ok) {
        throw new Error(authData.error?.message || "Gagal melakukan autentikasi peserta.");
      }

      // 2. Daftar ke Batch
      const enrollRes = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: selectedBatchId,
          registrationDocs: { status: "pending" } // Dummy docs
        }),
      });

      const enrollData = await enrollRes.json();
      if (!enrollRes.ok) {
        throw new Error(enrollData.error?.message || "Gagal mendaftarkan peserta ke batch ini.");
      }

      setSuccess(true);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Terjadi kendala saat memproses pendaftaran."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="britsafe-card" style={{ padding: '60px 40px', textAlign: 'center', borderTop: '4px solid var(--ajs-green)' }}>
        <div style={{ fontSize: '48px', color: 'var(--ajs-green)', marginBottom: '16px' }}>✓</div>
        <h2 className="britsafe-card__title" style={{ fontSize: '28px', marginBottom: '16px' }}>Pendaftaran Berhasil!</h2>
        <p className="britsafe-card__copy" style={{ marginBottom: '32px' }}>
          Data Anda telah masuk ke sistem. Silakan periksa email atau SMS Anda untuk tautan login (Magic Link) dan instruksi pembayaran/verifikasi selanjutnya.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/peserta" className="btn btn-primary">
            Buka Dashboard Peserta
          </Link>
          <Link href="/" className="btn btn-outline" style={{ color: 'var(--ajs-navy)', borderColor: 'var(--ajs-border)' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="britsafe-card" style={{ padding: '40px' }} onSubmit={handleSubmit}>
      <h2 className="britsafe-card__title" style={{ marginBottom: '24px' }}>Formulir Pendaftaran</h2>

      {error ? <div className="error-banner">{error}</div> : null}

      {!hasOpenBatch ? (
        <div
          style={{
            border: "1px solid rgba(227,30,36,0.25)",
            background: "rgba(227,30,36,0.08)",
            color: "var(--ajs-red)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
            fontSize: "13px",
            marginBottom: "16px"
          }}
        >
          Saat ini belum ada batch dengan kuota tersedia.
        </div>
      ) : null}

      <div className="field-group">
        <label className="field-label">Pilih Program & Batch</label>
        <select 
          className="text-input" 
          value={selectedBatchId} 
          onChange={(e) => setSelectedBatchId(e.target.value)}
          disabled={!hasOpenBatch}
          required
        >
          <option value="">-- Pilih Batch --</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id} disabled={batch.quotaRemaining <= 0}>
              {batch.programTitle} ({batch.industryType}) - {formatDateRange(batch.startDate, batch.endDate)} {batch.quotaRemaining <= 0 ? "[Penuh]" : ""}
            </option>
          ))}
        </select>
        <div className="field-helper">Pilih pelatihan yang ingin Anda ikuti sesuai ketersediaan kuota.</div>
      </div>

      <div className="field-group">
        <label className="field-label">Nama Lengkap Sesuai KTP</label>
        <input 
          type="text" 
          className="text-input" 
          placeholder="Cth. Budi Santoso"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px"
        }}
      >
        <div className="field-group">
          <label className="field-label">Alamat Email Aktif</label>
          <input 
            type="email" 
            className="text-input" 
            placeholder="budi@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label">Nomor WhatsApp</label>
          <input 
            type="tel" 
            className="text-input" 
            placeholder="081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="auth-form-meta" style={{ marginTop: '16px' }}>
        <span className="status-dot"></span>
        Data yang dikirim akan secara otomatis masuk ke sistem evaluasi internal AJS.
      </div>

      <button
        type="submit"
        className="cta-primary"
        disabled={isSubmitting || !hasOpenBatch}
      >
        {isSubmitting ? "Memproses Pendaftaran..." : "Daftar Pelatihan"}
      </button>
    </form>
  );
}
