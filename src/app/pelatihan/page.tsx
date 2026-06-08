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

const programIcons: Record<string, string> = {
  "Pengawas Operasional Pertama (POP)": "⛑️",
  "Pengawas Operasional Madya (POM)": "🦺",
  "Pengawas Operasional Utama (POU)": "🏗️",
};

const programHighlights: Record<string, string[]> = {
  "Pengawas Operasional Pertama (POP)": ["Bersertifikat BNSP", "Diklat 5 Hari", "Uji Kompetensi Resmi", "Materi Lengkap"],
  "Pengawas Operasional Madya (POM)": ["Bersertifikat BNSP", "Level Madya", "Untuk Pengawas Senior"],
  "Pengawas Operasional Utama (POU)": ["Bersertifikat BNSP", "Level Tertinggi", "Untuk Pimpinan Tambang"],
};

export default async function PelatihanPage() {
  const [programs, comingSoon] = await Promise.all([
    getPublicPrograms(),
    getComingSoonPrograms(),
  ]);

  const totalPrograms = programs.length + comingSoon.length;

  return (
    <div className="britsafe-site">
      <LandingHeader />

      <main>
        {/* Hero */}
        <section style={{
          backgroundImage: `linear-gradient(135deg, rgba(13,27,42,0.95) 0%, rgba(27,54,93,0.90) 60%, rgba(13,27,42,0.95) 100%), url('/images/hero-k3.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          padding: "90px 0 70px",
        }}>
          <div className="container">
            <span style={{ display: "inline-block", background: "var(--ajs-orange)", color: "white", padding: "6px 16px", borderRadius: "4px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>
              Program Sertifikasi
            </span>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: "900", color: "white", marginBottom: "16px", lineHeight: 1.15 }}>
              Pelatihan & Uji Kompetensi<br />
              <span style={{ color: "var(--ajs-orange)" }}>Bersertifikat BNSP</span>
            </h1>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.72)", maxWidth: "520px", lineHeight: 1.75, marginBottom: "40px" }}>
              Program pelatihan resmi di bidang pertambangan dan keselamatan kerja. Raih sertifikat kompetensi yang diakui secara nasional.
            </p>

            {/* Stats bar */}
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              {[
                { value: `${totalPrograms}`, label: "Program" },
                { value: "BNSP", label: "Lembaga Sertifikasi" },
                { value: "Online", label: "Mode Pelatihan" },
                { value: "5 Hari", label: "Durasi Diklat" },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "var(--ajs-orange)" }}>{stat.value}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "2px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section style={{ background: "white", padding: "56px 0", borderBottom: "1px solid var(--ajs-border)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px" }}>
              {[
                { icon: "🎓", title: "Bersertifikat Resmi", desc: "Sertifikat diterbitkan BNSP, diakui di seluruh Indonesia." },
                { icon: "👨‍🏫", title: "Instruktur Berpengalaman", desc: "Diajarkan oleh praktisi K3 berpengalaman di bidangnya." },
                { icon: "💻", title: "Pelatihan Online", desc: "Diklat via Zoom, fleksibel tanpa harus meninggalkan kerja." },
                { icon: "📋", title: "Materi Komprehensif", desc: "Kurikulum sesuai standar SKKNI dan regulasi terkini." },
              ].map(item => (
                <div key={item.title} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "28px", lineHeight: 1, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ajs-navy)", marginBottom: "4px" }}>{item.title}</div>
                    <div style={{ fontSize: "13px", color: "var(--ajs-muted)", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Active programs */}
        {programs.length > 0 && (
          <section style={{ background: "var(--ajs-gray)", padding: "60px 0" }}>
            <div className="container">
              <div style={{ marginBottom: "32px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--ajs-orange)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Pendaftaran Terbuka</span>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--ajs-navy)", margin: "8px 0 0" }}>Program yang Tersedia</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {programs.map((program) => {
                  const detailPage = programPageMap[program.title];
                  const icon = programIcons[program.title] ?? "📋";
                  const highlights = programHighlights[program.title] ?? [];
                  const earliestBatch = program.openBatches[0];

                  return (
                    <div key={program.id} style={{
                      background: "white",
                      borderRadius: "16px",
                      border: "1px solid var(--ajs-border)",
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                    }}>
                      {/* Left: info */}
                      <div style={{ padding: "32px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                          <div style={{ fontSize: "36px", lineHeight: 1 }}>{icon}</div>
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--ajs-green)", background: "rgba(0,166,81,0.1)", padding: "3px 10px", borderRadius: "20px" }}>
                              ● Pendaftaran Terbuka
                            </span>
                            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--ajs-navy)", margin: "6px 0 0", lineHeight: 1.2 }}>
                              {program.title}
                            </h3>
                          </div>
                        </div>

                        <p style={{ fontSize: "14px", color: "var(--ajs-muted)", lineHeight: 1.7, marginBottom: "20px", maxWidth: "560px" }}>
                          {program.description ?? `Program pelatihan ${program.industryType} bersertifikat BNSP untuk meningkatkan kompetensi profesional Anda.`}
                        </p>

                        {/* Highlights */}
                        {highlights.length > 0 && (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                            {highlights.map(h => (
                              <span key={h} style={{ fontSize: "12px", fontWeight: "600", padding: "4px 12px", background: "var(--ajs-gray)", color: "var(--ajs-navy)", borderRadius: "20px", border: "1px solid var(--ajs-border)" }}>
                                ✓ {h}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Batch schedule */}
                        {program.openBatches.length > 0 && (
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--ajs-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
                              Jadwal Batch
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {program.openBatches.map((batch) => (
                                <div key={batch.id} style={{ padding: "8px 14px", background: "var(--ajs-gray)", borderRadius: "8px", fontSize: "13px", border: "1px solid var(--ajs-border)" }}>
                                  <div style={{ fontWeight: "700", color: "var(--ajs-navy)" }}>
                                    {formatDateRange(new Date(batch.startDate), new Date(batch.endDate))}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "var(--ajs-muted)", marginTop: "2px" }}>
                                    Sisa {batch.quotaRemaining} kursi
                                    {batch.price ? ` · ${formatCurrency(batch.price)}` : ""}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: CTA */}
                      <div style={{
                        padding: "32px 28px",
                        background: "linear-gradient(135deg, #0d1b2a, #1b365d)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        minWidth: "200px",
                        textAlign: "center"
                      }}>
                        {earliestBatch?.price && (
                          <div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>Investasi</div>
                            <div style={{ fontSize: "22px", fontWeight: "900", color: "var(--ajs-orange)" }}>
                              {formatCurrency(earliestBatch.price)}
                            </div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>per peserta</div>
                          </div>
                        )}

                        {detailPage && (
                          <Link href={detailPage} style={{
                            display: "block",
                            width: "100%",
                            padding: "12px 20px",
                            background: "var(--ajs-orange)",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "14px",
                            textDecoration: "none",
                            textAlign: "center"
                          }}>
                            Info Lengkap →
                          </Link>
                        )}

                        <Link href={detailPage ? `${detailPage}/daftar` : `/daftar?batchId=${earliestBatch?.id ?? ""}`} style={{
                          display: "block",
                          width: "100%",
                          padding: "12px 20px",
                          background: "white",
                          color: "var(--ajs-navy)",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "14px",
                          textDecoration: "none",
                          textAlign: "center"
                        }}>
                          Daftar Sekarang
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <section style={{ background: "white", padding: "60px 0" }}>
            <div className="container">
              <div style={{ marginBottom: "32px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--ajs-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Dalam Persiapan</span>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--ajs-navy)", margin: "8px 0 0" }}>Segera Hadir</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {comingSoon.map((program) => {
                  const icon = programIcons[program.title] ?? "📋";
                  const highlights = programHighlights[program.title] ?? [];
                  return (
                    <div key={program.id} style={{
                      borderRadius: "12px",
                      border: "2px dashed var(--ajs-border)",
                      padding: "28px",
                      background: "#fafafa",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "11px", fontWeight: "700", padding: "4px 10px", background: "var(--ajs-navy)", color: "white", borderRadius: "20px" }}>
                        Segera Hadir
                      </div>
                      <div style={{ fontSize: "32px", marginBottom: "12px" }}>{icon}</div>
                      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--ajs-navy)", marginBottom: "8px" }}>{program.title}</h3>
                      <p style={{ fontSize: "13px", color: "var(--ajs-muted)", lineHeight: 1.6, marginBottom: "16px" }}>
                        {program.description ?? `Program pelatihan ${program.industryType}.`}
                      </p>
                      {highlights.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {highlights.map(h => (
                            <span key={h} style={{ fontSize: "11px", padding: "3px 10px", background: "var(--ajs-gray)", color: "var(--ajs-muted)", borderRadius: "20px", border: "1px solid var(--ajs-border)" }}>
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: "20px" }}>
                        <a
                          href={`https://wa.me/6282396792362?text=${encodeURIComponent(`Halo Admin, saya ingin mendapat info dan jadwal program ${program.title}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "13px", fontWeight: "700", color: "var(--ajs-orange)", textDecoration: "none" }}
                        >
                          Beritahu saya saat tersedia →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section style={{
          backgroundImage: "linear-gradient(135deg, #0d1b2a 0%, #1b365d 100%)",
          padding: "64px 0",
          textAlign: "center"
        }}>
          <div className="container">
            <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: "800", color: "white", marginBottom: "12px" }}>
              Tidak menemukan program yang Anda cari?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", marginBottom: "32px", maxWidth: "480px", margin: "0 auto 32px" }}>
              Hubungi admin kami. Kami siap membantu Anda menemukan program sertifikasi yang tepat.
            </p>
            <a
              href={`https://wa.me/6282396792362?text=${encodeURIComponent("Halo Admin, saya ingin menanyakan program pelatihan yang tersedia di Arkama Jaya Sertifikasi.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#25D366", color: "white", padding: "14px 32px", borderRadius: "8px", fontWeight: "700", fontSize: "15px", textDecoration: "none" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Konsultasi via WhatsApp
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
