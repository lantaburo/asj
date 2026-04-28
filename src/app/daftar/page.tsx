import { Suspense } from "react";
import Link from "next/link";
import { AJSLogo } from "@/features/landing-page/logo";
import { compareDateStrings } from "@/features/landing-page/landing-page.service";
import { getPublicPrograms } from "@/features/programs/program.service";
import { RegisterForm } from "@/features/enrollments/register-form";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  let upcomingBatches: {
    id: string;
    startDate: string;
    endDate: string;
    quotaRemaining: number;
    price: number | null;
    programTitle: string;
    industryType: string;
  }[] = [];
  let pageNotice: string | null = null;

  try {
    const programs = await getPublicPrograms();

    // Extract all open batches
    upcomingBatches = programs
      .flatMap((program) =>
        program.openBatches.map((batch) => ({
          id: batch.id,
          startDate: batch.startDate,
          endDate: batch.endDate,
          quotaRemaining: batch.quotaRemaining,
          price: batch.price,
          programTitle: program.title,
          industryType: program.industryType
        }))
      )
      .sort((left, right) => compareDateStrings(left.startDate, right.startDate));
  } catch (error) {
    logger.error({
      scope: "public-register",
      message: "Failed to render public register page.",
      error
    });
    pageNotice =
      "Data batch publik sementara belum dapat dimuat penuh. Anda masih bisa membuka formulir, tetapi jadwal yang tersedia mungkin belum lengkap.";
  }

  return (
    <div className="britsafe-site">
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
            <Link href="/" className="btn btn-outline" style={{ color: 'var(--ajs-navy)', borderColor: 'var(--ajs-border)' }}>Kembali ke Beranda</Link>
            <Link href="/peserta">Dashboard Peserta</Link>
            <Link href="/masuk" className="britsafe-btn-auth">
              Masuk Admin
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="britsafe-hero" style={{ paddingBlock: '60px' }}>
          <div className="container">
            <div className="britsafe-hero__content">
              <span className="britsafe-hero__kicker">Pendaftaran Pelatihan K3</span>
              <h1 className="britsafe-hero__title" style={{ fontSize: '42px' }}>
                Langkah Awal Menuju Standar Keselamatan Global.
              </h1>
              <p className="britsafe-hero__lead">
                Daftar sekarang untuk bergabung dengan batch pelatihan yang sesuai dengan kualifikasi dan industri Anda.
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            {pageNotice ? (
              <div
                className="britsafe-card"
                style={{
                  marginBottom: "24px",
                  padding: "18px 20px",
                  borderTop: "4px solid var(--ajs-orange)"
                }}
              >
                <strong style={{ display: "block", marginBottom: "8px", color: "var(--ajs-navy)" }}>
                  Katalog pendaftaran sedang dipulihkan
                </strong>
                <p style={{ margin: 0, color: "var(--ajs-muted)", fontSize: "14px" }}>
                  {pageNotice}
                </p>
              </div>
            ) : null}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
                alignItems: "start"
              }}
            >
              <div>
                <Suspense fallback={<div className="britsafe-card" style={{ padding: '40px' }}>Memuat formulir...</div>}>
                  <RegisterForm batches={upcomingBatches} />
                </Suspense>
              </div>

              <aside>
                <div className="britsafe-card" style={{ background: 'var(--ajs-navy)', color: 'white', padding: '32px' }}>
                  <h3 className="britsafe-card__title" style={{ color: 'white', fontSize: '18px' }}>Informasi Pendaftaran</h3>
                  <div style={{ display: 'grid', gap: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                      <strong style={{ color: 'var(--ajs-orange)', display: 'block', marginBottom: '4px' }}>Verifikasi Identitas</strong>
                      Pastikan email dan nomor yang Anda masukkan aktif, karena data tersebut dipakai untuk membuka sesi peserta dan menelusuri progres pelatihan Anda.
                    </div>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                      <strong style={{ color: 'var(--ajs-orange)', display: 'block', marginBottom: '4px' }}>Kuota Terbatas</strong>
                      Pendaftaran dapat ditutup sewaktu-waktu jika kuota kelas telah terisi penuh.
                    </div>
                    <div>
                      <strong style={{ color: 'var(--ajs-orange)', display: 'block', marginBottom: '4px' }}>Bantuan</strong>
                      Jika mengalami kesulitan, hubungi cs@arkamajayasertifikasi.id
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
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
