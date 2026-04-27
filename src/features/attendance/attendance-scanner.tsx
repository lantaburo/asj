"use client";

import { useState } from "react";

type Session = {
  id: string;
  title: string;
  sessionDate: string;
  locationType: string;
  batch: {
    program: {
      title: string;
    }
  }
};

export function AttendanceScanner({ sessions }: { sessions: Session[] }) {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !email) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Get GPS coordinates
      const gps = await new Promise<{lat: number, lng: number}>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Browser Anda tidak mendukung fitur lokasi/GPS."));
        } else {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(new Error("Gagal mengambil lokasi. Pastikan izin lokasi diberikan.")),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }
      });

      // 2. Resolve peserta dan bentuk sesi peserta MVP
      const authRes = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.error?.message || "Email tidak valid atau belum terdaftar.");

      // 3. Submit Attendance
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          gpsCoordinates: gps,
          status: "PRESENT",
          deviceInfo: navigator.userAgent
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal mencatat kehadiran.");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', background: 'rgba(0,166,81,0.1)', padding: '24px', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '32px', color: 'var(--ajs-green)', marginBottom: '8px' }}>✓</div>
        <h3 style={{ fontSize: '18px', color: 'var(--ajs-green)', fontWeight: '700', marginBottom: '8px' }}>Kehadiran Tercatat!</h3>
        <p style={{ fontSize: '14px', color: 'var(--ajs-text)' }}>Terima kasih, data absen dan lokasi Anda telah berhasil tervalidasi ke dalam sistem.</p>
        <button onClick={() => setSuccess(false)} className="btn btn-outline" style={{ marginTop: '16px' }}>Absen Ulang</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleScan} style={{ display: 'grid', gap: '20px' }}>
      {error && (
        <div className="error-banner" style={{ margin: 0 }}>
          {error}
        </div>
      )}

      <div className="field-group" style={{ margin: 0 }}>
        <label className="field-label">Email Terdaftar</label>
        <input 
          type="email" 
          className="text-input" 
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="field-helper">Gunakan email yang Anda pakai saat mendaftar.</div>
      </div>

      <div className="field-group" style={{ margin: 0 }}>
        <label className="field-label">Pilih Sesi Kelas Saat Ini</label>
        <select 
          className="text-input" 
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
          required
        >
          <option value="">-- Pilih Sesi --</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {session.title} - {session.batch.program.title}
            </option>
          ))}
        </select>
        <div className="field-helper">Absensi wajib dilakukan pada lokasi kelas (Validasi GPS Aktif).</div>
      </div>

      <button type="submit" className="cta-primary" disabled={isSubmitting}>
        {isSubmitting ? "Mendapatkan Lokasi & Menyimpan..." : "Kirim Absensi K3"}
      </button>
    </form>
  );
}
