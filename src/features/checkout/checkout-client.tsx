"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/features/landing-page/landing-page.service";
import { uploadPaymentProof } from "./checkout.service";
import { Upload, CheckCircle2, Clock } from "lucide-react";

type InvoiceDetail = any; // We'll pass the full prisma payload from the page
type PaymentSetting = any; // Also pass active payment settings

export function CheckoutClient({ invoice, paymentSettings }: { invoice: InvoiceDetail, paymentSettings: PaymentSetting[] }) {
  const router = useRouter();
  const [proofUrl, setProofUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewSrc(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/payment-proof", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload gagal.");
      setProofUrl(data.data.url);
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah file. Coba lagi.");
      setPreviewSrc("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) return alert("Silakan unggah bukti transfer.");
    
    setLoading(true);
    try {
      await uploadPaymentProof(invoice.id, proofUrl);
      setSuccess(true);
      router.refresh();
    } catch (error) {
      alert("Gagal mengunggah bukti pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  if (invoice.status === "PAID") {
    return (
      <div className="britsafe-card" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <CheckCircle2 size={64} style={{ color: 'var(--ajs-green)', margin: '0 auto 20px' }} />
        <h2 style={{ color: 'var(--ajs-navy)', marginBottom: '16px' }}>Pembayaran Lunas!</h2>
        <p style={{ color: 'var(--ajs-muted)', marginBottom: '32px' }}>
          Terima kasih. Pembayaran Anda untuk tagihan <strong>{invoice.invoiceNumber}</strong> telah diverifikasi.
        </p>
        <button onClick={() => router.push('/peserta')} className="btn btn-primary">
          Masuk ke Dashboard Peserta
        </button>
      </div>
    );
  }

  if (invoice.status === "PENDING_VERIFICATION" || success) {
    return (
      <div className="britsafe-card" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <Clock size={64} style={{ color: '#F59E0B', margin: '0 auto 20px' }} />
        <h2 style={{ color: 'var(--ajs-navy)', marginBottom: '16px' }}>Menunggu Verifikasi Admin</h2>
        <p style={{ color: 'var(--ajs-muted)', marginBottom: '32px' }}>
          Kami telah menerima bukti transfer Anda. Admin kami akan segera memverifikasi pembayaran Anda (maksimal 1x24 jam kerja).
        </p>
        <button onClick={() => router.push('/peserta')} className="btn btn-primary">
          Masuk ke Dashboard Peserta
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', display: 'grid', gap: '30px', padding: '0 20px' }}>
      <div className="britsafe-card" style={{ padding: '40px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: 'var(--ajs-navy)' }}>Checkout Pembayaran</h1>
        <p style={{ margin: '0 0 32px 0', color: 'var(--ajs-muted)' }}>Selesaikan pembayaran untuk mengamankan kursi Anda.</p>
        
        <div style={{ background: 'var(--ajs-gray)', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ajs-border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <span style={{ color: 'var(--ajs-muted)' }}>No. Tagihan</span>
            <strong style={{ color: 'var(--ajs-navy)' }}>{invoice.invoiceNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ajs-border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <span style={{ color: 'var(--ajs-muted)' }}>Program</span>
            <strong style={{ color: 'var(--ajs-navy)', textAlign: 'right' }}>
              {invoice.enrollment.batch.program.title}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ajs-border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <span style={{ color: 'var(--ajs-muted)' }}>Nama Peserta</span>
            <strong style={{ color: 'var(--ajs-navy)' }}>{invoice.enrollment.user.fullName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--ajs-navy)', fontSize: '18px', fontWeight: 'bold' }}>Total Pembayaran</span>
            <span style={{ color: 'var(--ajs-green)', fontSize: '24px', fontWeight: '900' }}>
              {formatCurrency(invoice.amount)}
            </span>
          </div>
        </div>

        <h3 style={{ margin: '0 0 16px 0', color: 'var(--ajs-navy)' }}>Pilih Metode Transfer Manual</h3>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
          {paymentSettings.length > 0 ? paymentSettings.map((bank: any) => (
            <div key={bank.id} style={{ border: '2px solid var(--ajs-teal)', padding: '20px', borderRadius: '12px', background: 'rgba(38, 166, 154, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--ajs-navy)', fontSize: '18px' }}>{bank.bankName}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', letterSpacing: '1px' }}>{bank.accountNumber}</p>
                  <p style={{ margin: 0, color: 'var(--ajs-muted)' }}>a/n <strong>{bank.accountName}</strong></p>
                </div>
              </div>
              {bank.instructions && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#FFF3E0', borderRadius: '8px', fontSize: '13px', color: '#E65100' }}>
                  <strong>Instruksi:</strong> {bank.instructions}
                </div>
              )}
            </div>
          )) : (
            <div style={{ padding: '20px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '8px' }}>
              Admin belum mengonfigurasi rekening bank pembayaran. Silakan hubungi Customer Service.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--ajs-border)', paddingTop: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--ajs-navy)' }}>Konfirmasi Pembayaran</h3>
          <p style={{ color: 'var(--ajs-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Setelah Anda melakukan transfer, wajib mengunggah foto bukti transfer agar kami dapat memverifikasinya.
          </p>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Unggah Bukti Transfer (JPG/PNG)</label>
            <div style={{ border: '2px dashed var(--ajs-border)', padding: '20px', textAlign: 'center', borderRadius: '12px', background: 'var(--ajs-gray)' }}>
              {previewSrc ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewSrc} alt="Preview bukti transfer" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'contain', display: 'block', margin: '0 auto 12px' }} />
                  {uploading ? (
                    <span style={{ color: 'var(--ajs-muted)', fontSize: '13px' }}>⏳ Mengunggah...</span>
                  ) : proofUrl ? (
                    <span style={{ color: 'var(--ajs-green)', fontWeight: 'bold', fontSize: '13px' }}>✓ File berhasil diunggah</span>
                  ) : null}
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--ajs-navy)', textDecoration: 'underline' }}>
                      Ganti foto
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={32} style={{ color: 'var(--ajs-muted)', margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: 'var(--ajs-muted)', fontSize: '13px', margin: '0 0 12px' }}>Klik untuk memilih foto bukti transfer</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', margin: '0 auto' }} required />
                </>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading || !proofUrl} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
            {loading ? "Memproses..." : "Kirim Bukti Pembayaran"}
          </button>
        </form>
      </div>
    </div>
  );
}
