import Link from "next/link";
import { redirect } from "next/navigation";
import { AJSLogo } from "@/features/landing-page/logo";

import { AdminNav } from "@/features/admin/admin-nav";
import { AdminLogoutButton } from "@/features/auth/admin-logout-button";
import {
  canAccessAdminPortal,
  canManageMasterData,
  canManageLandingSettings,
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
  const canOpenLandingSettings = canManageLandingSettings(currentUser.role);

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
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ajs-orange)', textTransform: 'uppercase' }}>
              Admin Mode: {currentUser.role}
            </span>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>

      <main className="britsafe-gray" style={{ minHeight: 'calc(100vh - 140px)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          <aside style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '100px', zIndex: 10 }}>
            <div style={{ marginBottom: '24px' }}>
              <AdminNav canOpenMasterData={canOpenMasterData} canOpenLandingSettings={canOpenLandingSettings} />
            </div>
            <div style={{ background: 'var(--gradient-footer)', color: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>Akses Cepat</h3>
              <Link href="/admin/artikel" className="btn btn-outline" style={{ width: '100%', fontSize: '13px' }}>
                Artikel
              </Link>
            </div>
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>
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
