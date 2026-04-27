import Link from "next/link";
import { redirect } from "next/navigation";
import { AJSLogo } from "@/features/landing-page/logo";

import { AdminLoginForm } from "@/features/auth/admin-login-form";
import {
  canAccessAdminPortal,
  getCurrentSessionUser
} from "@/features/auth/auth.service";

function resolveNextPath(rawNextPath?: string) {
  if (!rawNextPath || !rawNextPath.startsWith("/") || rawNextPath.startsWith("//")) {
    return "/admin";
  }

  return rawNextPath;
}

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentUser = await getCurrentSessionUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath = resolveNextPath(resolvedSearchParams?.next);

  if (currentUser && canAccessAdminPortal(currentUser.role)) {
    redirect(nextPath);
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
            <Link href="/daftar">Flow Daftar</Link>
            <Link href="/peserta">Portal Peserta</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="britsafe-hero" style={{ paddingBlock: '80px' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div className="britsafe-hero__content">
                <span className="britsafe-hero__kicker">Internal Workspace Access</span>
                <h1 className="britsafe-hero__title" style={{ fontSize: '48px' }}>
                  Akses Terkontrol untuk Tim Operasional.
                </h1>
                <p className="britsafe-hero__lead">
                  Masuk ke panel internal ARKAMA JAYA SERTIFIKASI untuk mengelola master data, 
                  verifikasi peserta, dan penerbitan sertifikasi.
                </p>
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8 }}>
                  <span>✓ Session 12 jam</span>
                  <span>✓ HTTP-only cookie</span>
                  <span>✓ RBAC Active</span>
                </div>
              </div>

              <div className="britsafe-card" style={{ padding: '40px' }}>
                <h2 className="britsafe-card__title" style={{ marginBottom: '24px' }}>Login Admin</h2>
                <AdminLoginForm />
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--ajs-border)', fontSize: '13px', color: 'var(--ajs-muted)' }}>
                  Lupa password atau butuh akses baru? Hubungi tim IT Support ARKAMA JAYA.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding britsafe-gray">
          <div className="container">
            <div className="britsafe-grid">
              <div className="britsafe-card">
                <h3 className="britsafe-card__title">Keamanan Terjamin</h3>
                <p className="britsafe-card__copy">
                  Setiap akses diaudit dan dibatasi berdasarkan peran (Role-Based Access Control) 
                  untuk menjaga integritas data sertifikasi.
                </p>
              </div>
              <div className="britsafe-card">
                <h3 className="britsafe-card__title">Sinkronisasi Data</h3>
                <p className="britsafe-card__copy">
                  Perubahan yang dilakukan di panel ini akan langsung tercermin pada katalog 
                  publik secara real-time.
                </p>
              </div>
              <div className="britsafe-card">
                <h3 className="britsafe-card__title">Audit Trail</h3>
                <p className="britsafe-card__copy">
                  Seluruh aktivitas verifikasi dan pendaftaran terekam dalam sistem untuk 
                  kebutuhan audit internal.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
