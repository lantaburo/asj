"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const initialBatchId = searchParams.get("batchId") || "";
  
  const [formMode, setFormMode] = useState<"choice" | "login" | "register">("choice");
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasOpenBatch = batches.some((batch) => batch.quotaRemaining > 0);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formMode === "register" && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (formMode === "register" && !selectedBatchId) {
      setError("Silakan pilih batch pelatihan terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Authenticate (Login or Register)
      const authRes = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          phone: formMode === "register" ? phone : undefined, 
          fullName: formMode === "register" ? fullName : undefined,
          password 
        }),
      });

      const authData = await authRes.json();
      if (!authRes.ok) {
        throw new Error(authData.error?.message || "Gagal melakukan autentikasi.");
      }

      // 2. If registering, also enroll
      if (formMode === "register") {
        const enrollRes = await fetch("/api/enrollment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batchId: selectedBatchId
          }),
        });

        const enrollData = await enrollRes.json();
        if (!enrollRes.ok) {
          throw new Error(enrollData.error?.message || "Gagal mendaftarkan ke batch ini.");
        }
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
        <h2 className="britsafe-card__title" style={{ fontSize: '28px', marginBottom: '16px' }}>
          {formMode === "login" ? "Login Berhasil!" : "Pendaftaran Berhasil!"}
        </h2>
        <p className="britsafe-card__copy" style={{ marginBottom: '32px' }}>
          {formMode === "login" 
            ? "Sesi Anda telah dipulihkan. Lanjutkan ke Dashboard untuk melihat aktivitas Anda."
            : "Akun Anda telah dibuat dan pendaftaran batch berhasil. Gunakan email & password Anda untuk masuk kembali nanti."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/peserta" className="btn btn-primary">
            Buka Dashboard Saya
          </Link>
          <Link href="/" className="btn btn-outline" style={{ color: 'var(--ajs-navy)', borderColor: 'var(--ajs-border)' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (formMode === "choice") {
    return (
      <div className="britsafe-card" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 className="britsafe-card__title" style={{ marginBottom: '16px' }}>Selamat Datang</h2>
        <p className="britsafe-card__copy" style={{ marginBottom: '32px' }}>
          Silakan tentukan apakah Anda ingin mendaftar pelatihan baru atau masuk ke akun yang sudah ada.
        </p>
        <div style={{ display: 'grid', gap: '16px' }}>
          <button onClick={() => setFormMode("register")} className="cta-primary">
            Saya Ingin Daftar Baru
          </button>
          <button 
            onClick={() => setFormMode("login")} 
            className="cta-secondary"
            style={{ width: '100%', minHeight: '52px' }}
          >
            Sudah Punya Akun? Masuk Disini
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="britsafe-card" style={{ padding: '40px' }} onSubmit={handleAction}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="britsafe-card__title" style={{ margin: 0 }}>
          {formMode === "login" ? "Masuk Peserta" : "Formulir Pendaftaran"}
        </h2>
        <button 
          type="button" 
          onClick={() => setFormMode("choice")}
          style={{ background: 'none', color: 'var(--ajs-navy)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          &larr; Kembali
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      {formMode === "register" && (
        <>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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
        </>
      )}

      {formMode === "login" && (
        <div className="field-group">
          <label className="field-label">Alamat Email</label>
          <input 
            type="email" 
            className="text-input" 
            placeholder="budi@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: formMode === "register" ? "repeat(auto-fit, minmax(220px, 1fr))" : "1fr", gap: "16px" }}>
        <div className="field-group">
          <label className="field-label">Password</label>
          <input 
            type="password" 
            className="text-input" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {formMode === "register" && (
          <div className="field-group">
            <label className="field-label">Konfirmasi Password</label>
            <input 
              type="password" 
              className="text-input" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="auth-form-meta" style={{ marginTop: '16px' }}>
        <span className="status-dot"></span>
        {formMode === "register" 
          ? "Akun Anda akan diamankan dengan password ini untuk akses Dashboard Peserta di masa mendatang."
          : "Gunakan email dan password yang Anda daftarkan sebelumnya."}
      </div>

      <button
        type="submit"
        className="cta-primary"
        disabled={isSubmitting || (formMode === "register" && !hasOpenBatch)}
      >
        {isSubmitting ? "Memproses..." : (formMode === "login" ? "Masuk Dashboard" : "Daftar & Buat Akun")}
      </button>
    </form>
  );
}
