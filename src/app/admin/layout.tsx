import Link from "next/link";
import { redirect } from "next/navigation";
import { AJSLogo } from "@/features/landing-page/logo";

import { AdminNav } from "@/features/admin/admin-nav";
import { AdminLogoutButton } from "@/features/auth/admin-logout-button";
import {
  canAccessAdminPortal,
  canManageMasterData,
  getCurrentSessionUser
} from "@/features/auth/auth.service";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/masuk?next=/admin");
  }

  if (!canAccessAdminPortal(currentUser.role)) {
    redirect("/masuk?next=/admin");
  }

  const canOpenMasterData = canManageMasterData(currentUser.role);

  return (
    <div className="britsafe-site">
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <nav className="britsafe-nav">
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ajs-orange)', textTransform: 'uppercase' }}>
              Admin Mode: {currentUser.role}
            </span>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>

      <main className="section-padding britsafe-gray">
        <div className="container">
          <section className="britsafe-card" style={{ marginBottom: '40px', padding: '40px' }}>
            <div className="admin-layout-hero">
              <div>
                <span className="britsafe-card__category">Internal Command Center</span>
                <h1 className="britsafe-card__title" style={{ fontSize: '36px', marginBottom: '16px' }}>
                  Dashboard Operasional ARKAMA JAYA SERTIFIKASI
                </h1>
                <p className="britsafe-card__copy" style={{ fontSize: '16px', marginBottom: '32px' }}>
                  Selamat datang kembali, <strong>{currentUser.fullName}</strong>. 
                  Gunakan panel ini untuk mengelola master data pelatihan, verifikasi peserta, 
                  dan memantau operasional sistem secara real-time.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid var(--ajs-border)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ajs-muted)', textTransform: 'uppercase' }}>Email</span>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{currentUser.email}</div>
                  </div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid var(--ajs-border)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ajs-muted)', textTransform: 'uppercase' }}>Role</span>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{currentUser.role}</div>
                  </div>
                </div>
              </div>

              <aside style={{ display: 'grid', gap: '20px' }}>
                <AdminNav canOpenMasterData={canOpenMasterData} />
                <div style={{ background: 'var(--ajs-navy)', color: 'white', padding: '24px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>Akses Cepat</h3>
                  <Link href="/" className="btn btn-outline" style={{ width: '100%', fontSize: '14px' }}>
                    Lihat Landing Publik
                  </Link>
                </div>
              </aside>
            </div>
          </section>

          {children}
        </div>
      </main>

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Internal Workspace.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
