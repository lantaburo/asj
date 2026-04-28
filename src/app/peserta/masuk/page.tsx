import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AJSLogo } from "@/features/landing-page/logo";
import { ParticipantLoginForm } from "@/features/auth/participant-login-form";
import {
  canAccessAdminPortal,
  getCurrentSessionUser
} from "@/features/auth/auth.service";

function resolveNextPath(rawNextPath?: string) {
  if (!rawNextPath || !rawNextPath.startsWith("/") || rawNextPath.startsWith("//")) {
    return "/peserta";
  }

  return rawNextPath;
}

type ParticipantLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function ParticipantLoginPage({
  searchParams
}: ParticipantLoginPageProps) {
  const currentUser = await getCurrentSessionUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath = resolveNextPath(resolvedSearchParams?.next);

  if (currentUser?.role === "TRAINEE") {
    redirect(nextPath);
  }

  if (currentUser && canAccessAdminPortal(currentUser.role)) {
    redirect("/admin");
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
            <Link href="/daftar">Daftar Pelatihan</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="britsafe-hero" style={{ paddingBlock: "80px" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "60px",
                alignItems: "center"
              }}
            >
              <div className="britsafe-hero__content">
                <span className="britsafe-hero__kicker">Akses Dashboard Peserta</span>
                <h1 className="britsafe-hero__title" style={{ fontSize: "48px" }}>
                  Masuk Lagi untuk Lanjutkan Progres Pelatihan.
                </h1>
                <p className="britsafe-hero__lead">
                  Gunakan email atau nomor WhatsApp yang sama seperti saat pendaftaran
                  agar sesi peserta aktif kembali di browser ini.
                </p>
                <div style={{ display: "grid", gap: "14px", fontSize: "14px", opacity: 0.88 }}>
                  <span>✓ Tidak perlu daftar ulang batch</span>
                  <span>✓ Dashboard menampilkan enrollment dan sertifikat yang sama</span>
                  <span>✓ Sesi aman dengan cookie HTTP-only 12 jam</span>
                </div>
              </div>

              <div className="britsafe-card" style={{ padding: "40px" }}>
                <h2 className="britsafe-card__title" style={{ marginBottom: "24px" }}>
                  Login Peserta
                </h2>
                <Suspense fallback={<div style={{ padding: "20px", textAlign: "center", color: "var(--ajs-muted)", fontSize: "14px" }}>Memuat form...</div>}>
                  <ParticipantLoginForm />
                </Suspense>
                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "24px",
                    borderTop: "1px solid var(--ajs-border)",
                    fontSize: "13px",
                    color: "var(--ajs-muted)"
                  }}
                >
                  Belum pernah daftar? Mulai dari <Link href="/daftar">form pendaftaran pelatihan</Link>.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ borderTop: "none", paddingTop: 0 }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
