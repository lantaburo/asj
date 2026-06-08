"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";

type Batch = {
  id: string;
  startDate: string;
  endDate: string;
  quota: number;
  quotaRemaining: number;
  price: number | null;
};

type CurrentUser = { id: string; fullName: string; email: string } | null;

type Status = "form" | "submitting" | "success_invoice" | "success_free" | "error";

export function PopDaftarClient({
  batches,
  initialBatchId,
  currentUser
}: {
  batches: Batch[];
  initialBatchId: string;
  currentUser: CurrentUser;
}) {
  const router = useRouter();
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || (batches[0]?.id ?? ""));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number | null>(null);

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const isLoggedIn = !!currentUser;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedBatchId) {
      setErrorMsg("Pilih batch pelatihan terlebih dahulu.");
      return;
    }
    if (!isLoggedIn && password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak sesuai.");
      return;
    }

    setStatus("submitting");

    try {
      // Step 1: Auth (register or login)
      if (!isLoggedIn) {
        const authRes = await fetch("/api/auth/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone, fullName, password })
        });
        const authData = await authRes.json();
        if (!authRes.ok) {
          throw new Error(authData.error?.message || "Gagal membuat akun. Coba dengan email berbeda.");
        }
      }

      // Step 2: Enroll
      const enrollRes = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: selectedBatchId })
      });
      const enrollData = await enrollRes.json();
      if (!enrollRes.ok) {
        throw new Error(enrollData.error?.message || "Gagal mendaftarkan ke batch ini.");
      }

      const invoice = enrollData.data?.invoice;
      if (invoice?.id) {
        setInvoiceId(invoice.id);
        setInvoiceNumber(invoice.invoiceNumber ?? null);
        setInvoiceAmount(invoice.amount ?? null);
        setStatus("success_invoice");
      } else {
        setStatus("success_free");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setStatus("error");
    }
  }

  // SUCCESS — has invoice (payment required)
  if (status === "success_invoice") {
    return (
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", border: "1px solid var(--ajs-border)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--ajs-navy)", margin: "0 0 8px" }}>
            Pendaftaran Berhasil!
          </h2>
          <p style={{ fontSize: "14px", color: "var(--ajs-muted)", margin: 0 }}>
            Akun Anda telah dibuat dan pendaftaran tercatat.
          </p>
        </div>

        {invoiceNumber && (
          <div style={{ background: "var(--ajs-gray)", borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: "var(--ajs-muted)", marginBottom: "4px" }}>Nomor Invoice</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--ajs-navy)", letterSpacing: "1px" }}>{invoiceNumber}</div>
            {invoiceAmount && (
              <div style={{ fontSize: "14px", color: "var(--ajs-orange)", fontWeight: "700", marginTop: "4px" }}>
                Total: {formatCurrency(invoiceAmount)}
              </div>
            )}
          </div>
        )}

        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--ajs-navy)", marginBottom: "16px" }}>
          Langkah Selanjutnya:
        </h3>
        {[
          { num: 1, title: "Selesaikan Pembayaran", desc: "Klik tombol di bawah untuk melihat detail invoice dan instruksi transfer.", highlight: true },
          { num: 2, title: "Upload Dokumen Persyaratan", desc: "Login ke Dashboard Peserta, lalu upload KTP, CV, Pas Foto, Ijazah, dan Surat Kerja." },
          { num: 3, title: "Tunggu Konfirmasi Admin", desc: "Kami akan memverifikasi pembayaran dan dokumen Anda dalam 1×24 jam kerja." },
          { num: 4, title: "Siapkan Diri untuk Pelatihan", desc: "Setelah dikonfirmasi, Anda akan mendapat info jadwal lengkap via WhatsApp/email." },
        ].map((step) => (
          <div key={step.num} style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: step.highlight ? "var(--ajs-navy)" : "var(--ajs-gray)",
              color: step.highlight ? "white" : "var(--ajs-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "14px",
              flexShrink: 0
            }}>
              {step.num}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--ajs-navy)", marginBottom: "2px" }}>{step.title}</div>
              <div style={{ fontSize: "13px", color: "var(--ajs-muted)" }}>{step.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          {invoiceId && (
            <button
              onClick={() => router.push(`/checkout/${invoiceId}`)}
              style={{
                flex: 2,
                minWidth: "200px",
                padding: "14px 20px",
                background: "var(--ajs-navy)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Bayar Sekarang →
            </button>
          )}
          <button
            onClick={() => router.push("/peserta")}
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "14px 20px",
              background: "transparent",
              color: "var(--ajs-navy)",
              border: "2px solid var(--ajs-border)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Dashboard Peserta
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS — free (no invoice)
  if (status === "success_free") {
    return (
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", border: "1px solid var(--ajs-border)", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--ajs-navy)", margin: "0 0 8px" }}>Terdaftar!</h2>
        <p style={{ color: "var(--ajs-muted)", marginBottom: "24px" }}>
          Akun dan pendaftaran Anda sudah diproses. Segera upload dokumen persyaratan.
        </p>
        <button
          onClick={() => router.push("/peserta")}
          style={{ padding: "14px 32px", background: "var(--ajs-navy)", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
        >
          Ke Dashboard Peserta →
        </button>
      </div>
    );
  }

  // FORM
  return (
    <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: "16px", padding: "32px", border: "1px solid var(--ajs-border)" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--ajs-navy)", margin: "0 0 24px" }}>
        {isLoggedIn ? `Halo, ${currentUser!.fullName} 👋` : "Formulir Pendaftaran"}
      </h2>

      {/* Batch selector */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Pilih Jadwal Batch</label>
        {batches.length === 0 ? (
          <div style={{ padding: "16px", background: "var(--ajs-gray)", borderRadius: "8px", fontSize: "14px", color: "var(--ajs-muted)" }}>
            Tidak ada batch POP yang terbuka saat ini. Hubungi admin untuk informasi jadwal berikutnya.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {batches.map(batch => {
              const isFull = batch.quotaRemaining <= 0;
              const isSelected = selectedBatchId === batch.id;
              return (
                <label
                  key={batch.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    border: `2px solid ${isSelected ? "var(--ajs-navy)" : "var(--ajs-border)"}`,
                    borderRadius: "8px",
                    cursor: isFull ? "not-allowed" : "pointer",
                    background: isSelected ? "rgba(0,51,102,0.04)" : "white",
                    opacity: isFull ? 0.5 : 1
                  }}
                >
                  <input
                    type="radio"
                    name="batchId"
                    value={batch.id}
                    checked={isSelected}
                    disabled={isFull}
                    onChange={() => setSelectedBatchId(batch.id)}
                    style={{ accentColor: "var(--ajs-navy)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--ajs-navy)" }}>
                      {formatDateRange(new Date(batch.startDate), new Date(batch.endDate))}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--ajs-muted)", marginTop: "2px" }}>
                      {isFull ? "❌ Penuh" : `Sisa ${batch.quotaRemaining} kursi`}
                      {batch.price ? ` · ${formatCurrency(batch.price)}` : " · Gratis"}
                    </div>
                  </div>
                  {isSelected && !isFull && (
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--ajs-green)", background: "rgba(0,166,81,0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                      Dipilih
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Already logged in — just show enroll button */}
      {isLoggedIn ? (
        <div style={{ padding: "16px", background: "var(--ajs-gray)", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", color: "var(--ajs-text)" }}>
          Anda sudah login sebagai <strong>{currentUser!.email}</strong>. Klik tombol di bawah untuk langsung mendaftar ke batch yang dipilih.
        </div>
      ) : (
        <>
          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--ajs-border)", margin: "24px 0", position: "relative" }}>
            <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "0 12px", fontSize: "12px", color: "var(--ajs-muted)" }}>
              Data Diri
            </span>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Nama Lengkap Sesuai KTP</label>
            <input type="text" style={inputStyle} placeholder="Budi Santoso" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Email Aktif</label>
              <input type="email" style={inputStyle} placeholder="budi@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Nomor WhatsApp</label>
              <input type="tel" style={inputStyle} placeholder="08123456789" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" style={inputStyle} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div>
              <label style={labelStyle}>Konfirmasi Password</label>
              <input type="password" style={inputStyle} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "var(--ajs-muted)", marginBottom: "20px" }}>
            Sudah punya akun?{" "}
            <a href="/masuk" style={{ color: "var(--ajs-orange)", fontWeight: "700", textDecoration: "none" }}>
              Login di sini
            </a>
          </p>
        </>
      )}

      {(status === "error") && errorMsg && (
        <div style={{ padding: "12px 16px", background: "rgba(227,30,36,0.08)", border: "1px solid rgba(227,30,36,0.2)", borderRadius: "8px", fontSize: "13px", color: "var(--ajs-red)", marginBottom: "16px" }}>
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || batches.length === 0}
        style={{
          display: "block",
          width: "100%",
          padding: "16px",
          background: "var(--ajs-navy)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "800",
          cursor: status === "submitting" ? "not-allowed" : "pointer",
          opacity: status === "submitting" ? 0.7 : 1
        }}
      >
        {status === "submitting" ? "Memproses..." : isLoggedIn ? "Daftar ke Batch Ini →" : "Buat Akun & Daftar Sekarang →"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  color: "var(--ajs-navy)",
  marginBottom: "6px"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--ajs-border)",
  borderRadius: "8px",
  fontSize: "14px",
  color: "var(--ajs-text)",
  boxSizing: "border-box"
};
