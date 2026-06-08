import Link from "next/link";
import { LandingHeader } from "@/features/landing-page/landing-header";
import { getPublicPrograms, getComingSoonPrograms } from "@/features/programs/program.service";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Pelatihan | Arkama Jaya Sertifikasi",
  description: "Pilih program pelatihan dan sertifikasi K3 yang tersedia di Arkama Jaya Sertifikasi. Bersertifikat BNSP & Kemnaker RI.",
};

const programPageMap: Record<string, string> = {
  "Pengawas Operasional Pertama (POP)": "/pelatihan/pop",
};

export default async function PelatihanPage() {
  const [programs, comingSoon] = await Promise.all([
    getPublicPrograms(),
    getComingSoonPrograms(),
  ]);

  return (
    <div className="britsafe-site">
      <LandingHeader />

      <main>
        {/* Hero */}
        <section style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #1b365d 100%)",
          padding: "80px 0 60px",
        }}>
          <div className="container">
            <span style={{ display: "inline-block", background: "var(--ajs-orange)", color: "white", padding: "6px 16px", borderRadius: "4px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>
              Program Pelatihan
            </span>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "900", color: "white", marginBottom: "12px" }}>
              Daftar Pelatihan & Sertifikasi
            </h1>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", maxWidth: "540px", lineHeight: 1.7 }}>
              Program pelatihan bersertifikat BNSP dan Kemnaker RI. Pilih program sesuai kebutuhan kompetensi Anda.
            </p>
          </div>
        </section>

        {/* Program List */}
        <section style={{ background: "var(--ajs-gray)", padding: "60px 0" }}>
          <div className="container">

            {programs.length === 0 && comingSoon.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ajs-muted)" }}>
                Belum ada program pelatihan yang tersedia saat ini.
              </div>
            )}

            {/* Active programs */}
            {programs.length > 0 && (
              <>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--ajs-navy)", marginBottom: "24px" }}>
                  Pendaftaran Terbuka
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginBottom: "48px" }}>
                  {programs.map((program) => {
                    const detailPage = programPageMap[program.title];
                    const earliestBatch = program.openBatches[0];
                    return (
                      <div key={program.id} style={{ background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--ajs-border)", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "24px 24px 0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--ajs-orange)", textTransform: "uppercase", letterSpacing: "1px" }}>
                              {program.categoryLabel}
                            </span>
                            <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px", background: "rgba(0,166,81,0.1)", color: "var(--ajs-green)" }}>
                              Terbuka
                            </span>
                          </div>
                          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--ajs-navy)", marginBottom: "8px", lineHeight: 1.3 }}>
                            {program.title}
                          </h3>
                          <p style={{ fontSize: "13px", color: "var(--ajs-muted)", lineHeight: 1.6, marginBottom: "16px" }}>
                            {program.description ?? `Pelatihan ${program.industryType} bersertifikat BNSP.`}
                          </p>
                        </div>

                        {/* Batch list */}
                        {program.openBatches.length > 0 && (
                          <div style={{ padding: "0 24px 16px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--ajs-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                              Jadwal Tersedia
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {program.openBatches.slice(0, 3).map((batch) => (
                                <div key={batch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--ajs-gray)", borderRadius: "6px", fontSize: "12px" }}>
                                  <span style={{ fontWeight: "600", color: "var(--ajs-navy)" }}>
                                    {formatDateRange(new Date(batch.startDate), new Date(batch.endDate))}
                                  </span>
                                  <span style={{ color: "var(--ajs-muted)" }}>
                                    {batch.quotaRemaining > 0 ? `Sisa ${batch.quotaRemaining} kursi` : "Penuh"}
                                    {batch.price ? ` · ${formatCurrency(batch.price)}` : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ padding: "16px 24px 24px", marginTop: "auto", display: "flex", gap: "10px" }}>
                          <Link
                            href={detailPage ?? `/daftar?batchId=${earliestBatch?.id ?? ""}`}
                            style={{ flex: 1, display: "block", textAlign: "center", padding: "12px", background: "var(--ajs-navy)", color: "white", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none" }}
                          >
                            {detailPage ? "Info & Daftar →" : "Daftar Sekarang →"}
                          </Link>
                          {detailPage && (
                            <Link
                              href={`/daftar?batchId=${earliestBatch?.id ?? ""}`}
                              style={{ display: "block", textAlign: "center", padding: "12px 16px", border: "1px solid var(--ajs-border)", color: "var(--ajs-navy)", borderRadius: "8px", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}
                            >
                              Daftar
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Coming soon */}
            {comingSoon.length > 0 && (
              <>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--ajs-navy)", marginBottom: "24px" }}>
                  Segera Hadir
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {comingSoon.map((program) => (
                    <div key={program.id} style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid var(--ajs-border)", opacity: 0.75 }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px", background: "var(--ajs-navy)", color: "white", display: "inline-block", marginBottom: "12px" }}>
                        Segera Hadir
                      </span>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--ajs-navy)", marginBottom: "6px" }}>
                        {program.title}
                      </h3>
                      <p style={{ fontSize: "13px", color: "var(--ajs-muted)", lineHeight: 1.6, margin: 0 }}>
                        {program.description ?? `Program ${program.industryType}.`}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "var(--ajs-navy)", padding: "60px 0", textAlign: "center" }}>
          <div className="container">
            <h2 style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: "800", color: "white", marginBottom: "12px" }}>
              Tidak menemukan program yang Anda cari?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", marginBottom: "28px" }}>
              Hubungi admin kami untuk informasi program pelatihan lainnya.
            </p>
            <a
              href={`https://wa.me/6282396792362?text=${encodeURIComponent("Halo Admin, saya ingin menanyakan program pelatihan yang tersedia.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#25D366", color: "white", padding: "14px 32px", borderRadius: "8px", fontWeight: "700", fontSize: "15px", textDecoration: "none" }}
            >
              Chat WhatsApp Admin
            </a>
          </div>
        </section>
      </main>

      <footer className="britsafe-footer" style={{ paddingBlock: "30px" }}>
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ borderTop: "none", paddingTop: 0 }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
