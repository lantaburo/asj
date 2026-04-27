import Link from "next/link";
import { AJSLogo } from "@/features/landing-page/logo";
import { getSessionList } from "@/features/sessions/session.service";
import { AttendanceScanner } from "@/features/attendance/attendance-scanner";

export const dynamic = "force-dynamic";

export default async function AbsenPage() {
  const sessions = await getSessionList();

  return (
    <div className="britsafe-site">
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <nav className="britsafe-nav">
            <Link href="/" className="btn btn-outline" style={{ color: 'var(--ajs-navy)', borderColor: 'var(--ajs-border)' }}>Kembali ke Beranda</Link>
          </nav>
        </div>
      </header>

      <main style={{ padding: '60px 20px', background: 'var(--ajs-gray)', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="britsafe-card" style={{ padding: '40px', borderTop: '4px solid var(--ajs-green)' }}>
            <span className="britsafe-card__category">Phase 6: Validasi Kehadiran</span>
            <h1 className="britsafe-card__title" style={{ fontSize: '28px', margin: '8px 0 16px' }}>Absensi Digital Peserta</h1>
            <p className="britsafe-card__copy" style={{ marginBottom: '32px' }}>
              Silakan pilih sesi kelas yang sedang berlangsung, pastikan GPS Anda aktif, dan catat kehadiran Anda.
            </p>

            <AttendanceScanner sessions={sessions} />
          </div>
        </div>
      </main>

      <footer className="britsafe-footer" style={{ paddingBlock: '30px' }}>
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
