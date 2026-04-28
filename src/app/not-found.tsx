import Link from "next/link";
import { AJSLogo } from "@/features/landing-page/logo";

export default function NotFound() {
  return (
    <div className="britsafe-site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <input type="checkbox" id="mobile-menu-toggle" className="mobile-menu-toggle" aria-label="Toggle mobile menu" />
          <label htmlFor="mobile-menu-toggle" className="mobile-menu-button">
            <span></span><span></span><span></span>
          </label>
          <nav className="britsafe-nav">
            <Link href="/" className="btn btn-outline" style={{ color: 'var(--ajs-navy)', borderColor: 'var(--ajs-border)' }}>
              Kembali ke Beranda
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'var(--ajs-gray)' }}>
        <div className="britsafe-card" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '80px', fontWeight: '900', color: 'var(--ajs-orange)', lineHeight: 1, marginBottom: '20px' }}>
            404
          </div>
          <h1 className="britsafe-card__title" style={{ fontSize: '28px', marginBottom: '16px' }}>
            Halaman Tidak Ditemukan
          </h1>
          <p className="britsafe-card__copy" style={{ fontSize: '16px', marginBottom: '32px' }}>
            Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau Anda salah mengetikkan URL. 
            Pastikan tautan yang Anda masukkan benar.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">
              Beranda Utama
            </Link>
            <Link href="/masuk" className="btn btn-outline" style={{ color: 'var(--ajs-navy)', borderColor: 'var(--ajs-border)' }}>
              Portal Internal
            </Link>
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
