import Link from "next/link";
import { AJSLogo } from "@/features/landing-page/logo";
import { getPublicPrograms } from "@/features/programs/program.service";
import { RegisterForm } from "@/features/enrollments/register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const programs = await getPublicPrograms();
  
  // Extract all open batches
  const upcomingBatches = programs
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
    .sort(
      (left, right) =>
        new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
    );

  return (
    <div className="britsafe-site">
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <nav className="britsafe-nav">
            <Link href="/" className="btn btn-outline" style={{ color: 'var(--ajs-navy)', borderColor: 'var(--ajs-border)' }}>Kembali ke Beranda</Link>
            <Link href="/peserta">Portal Peserta</Link>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
                alignItems: "start"
              }}
            >
              <div>
                <RegisterForm batches={upcomingBatches} />
              </div>

              <aside>
                <div className="britsafe-card" style={{ background: 'var(--ajs-navy)', color: 'white', padding: '32px' }}>
                  <h3 className="britsafe-card__title" style={{ color: 'white', fontSize: '18px' }}>Informasi Pendaftaran</h3>
                  <div style={{ display: 'grid', gap: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                      <strong style={{ color: 'var(--ajs-orange)', display: 'block', marginBottom: '4px' }}>Verifikasi Identitas</strong>
                      Pastikan email dan nomor yang Anda masukkan aktif, karena tautan akses ke logbook akan dikirimkan ke sana.
                    </div>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                      <strong style={{ color: 'var(--ajs-orange)', display: 'block', marginBottom: '4px' }}>Kuota Terbatas</strong>
                      Pendaftaran dapat ditutup sewaktu-waktu jika kuota kelas telah terisi penuh.
                    </div>
                    <div>
                      <strong style={{ color: 'var(--ajs-orange)', display: 'block', marginBottom: '4px' }}>Bantuan</strong>
                      Jika mengalami kesulitan, hubungi support@arkamajaya.co.id
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
