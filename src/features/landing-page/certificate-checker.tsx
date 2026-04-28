"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function CertificateChecker() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/verifikasi/${encodeURIComponent(code.trim())}`);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--ajs-navy)' }}>Cek Validitas Sertifikat</h3>
      <p style={{ fontSize: '15px', color: 'var(--ajs-muted)', marginBottom: '24px' }}>
        Masukkan Nomor Sertifikat atau Kode QR untuk memverifikasi keaslian sertifikat pelamar / karyawan.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ajs-muted)' }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            className="text-input"
            style={{ paddingLeft: '48px', margin: 0 }}
            placeholder="AJS-K3-..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="cta-primary" style={{ margin: 0, whiteSpace: 'nowrap', width: 'auto', padding: '12px 24px', fontSize: '14px' }}>
          Verifikasi
        </button>
      </form>
    </div>
  );
}
