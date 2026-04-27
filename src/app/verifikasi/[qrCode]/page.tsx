import Link from "next/link";
import { notFound } from "next/navigation";
import { AJSLogo } from "@/features/landing-page/logo";
import { getCertificateVerification } from "@/features/enrollments/enrollment.service";
import { formatDateRange } from "@/features/landing-page/landing-page.service";
import { AppError } from "@/lib/app-error";

export const dynamic = "force-dynamic";

type VerificationPageProps = {
  params: Promise<{
    qrCode: string;
  }>;
};

export default async function VerificationPage({ params }: VerificationPageProps) {
  const { qrCode } = await params;

  let certificate: Awaited<ReturnType<typeof getCertificateVerification>>;

  try {
    certificate = await getCertificateVerification(qrCode);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="britsafe-site">
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <nav className="britsafe-nav">
            <Link href="/">Home</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="britsafe-hero" style={{ paddingBlock: '60px' }}>
          <div className="container">
            <div className="britsafe-hero__content">
              <span className="britsafe-hero__kicker">Certificate Verification</span>
              <h1 className="britsafe-hero__title" style={{ fontSize: '42px' }}>
                Validasi Keaslian Sertifikat ARKAMA JAYA SERTIFIKASI.
              </h1>
              <p className="britsafe-hero__lead">
                Sistem verifikasi QR memastikan setiap sertifikat yang diterbitkan dapat divalidasi keasliannya 
                melalui database pendaftaran kami.
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
              <article className="britsafe-card" style={{ borderTop: '4px solid var(--ajs-green)' }}>
                <span className="britsafe-card__category" style={{ color: 'var(--ajs-green)' }}>
                  {certificate.issued ? "Verified Certificate" : certificate.assessmentStatus}
                </span>
                <h2 className="britsafe-card__title" style={{ fontSize: '28px', marginTop: '10px' }}>
                  {certificate.participant.fullName}
                </h2>
                <div style={{ display: 'grid', gap: '15px', marginTop: '20px', color: 'var(--ajs-navy)', fontWeight: '500' }}>
                  <div style={{ padding: '10px', background: 'var(--ajs-gray)', borderRadius: '4px' }}>
                    Program: <strong>{certificate.program.title}</strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--ajs-gray)', borderRadius: '4px' }}>
                    Kategori: <strong>{certificate.program.category}</strong>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--ajs-gray)', borderRadius: '4px' }}>
                    Batch: <strong>{formatDateRange(certificate.batch.startDate, certificate.batch.endDate)}</strong>
                  </div>
                </div>
              </article>

              <aside className="britsafe-card" style={{ background: 'var(--ajs-navy)', color: 'white' }}>
                <h3 className="britsafe-card__title" style={{ color: 'white' }}>Detail Sertifikasi</h3>
                <div style={{ display: 'grid', gap: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                  <div>Nomor: <strong style={{ color: 'white' }}>{certificate.certificateNum ?? "Belum diterbitkan"}</strong></div>
                  <div>QR Code: <strong style={{ color: 'white' }}>{certificate.qrVerifyCode}</strong></div>
                  <div>Masa Berlaku: <strong style={{ color: 'white' }}>{certificate.expiryDate ?? "Belum diatur"}</strong></div>
                  <div>Log Praktik: <strong style={{ color: 'white' }}>{certificate.k3LogCount} Sesi</strong></div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Sistem Verifikasi QR.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
