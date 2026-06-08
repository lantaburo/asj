import { Metadata } from "next";
import { LandingHeader } from "@/features/landing-page/landing-header";
import {
  CheckCircle,
  Calendar,
  Phone,
  FileText,
  Award,
  Monitor,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Diklat & Uji Kompetensi POP (Pengawas Operasional Pertama) | AJS",
  description:
    "Ikuti Diklat dan Uji Kompetensi Pengawas Operasional Pertama (POP) bersertifikat BNSP. Training online via Zoom. Daftar sekarang!",
};

const WA_NUMBER = "6282396792362";
const WA_MESSAGE = encodeURIComponent(
  "Halo Admin, saya ingin mendaftar Diklat & Uji Kompetensi POP (Pengawas Operasional Pertama). Mohon informasi lebih lanjut."
);
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

const fasilitas = [
  "Sertifikat Kompetensi BNSP",
  "Sertifikat Diklat POP",
  "Kartu Kompetensi POP",
  "Video Record Diklat",
  "Masa Berlaku Sertifikat 5 Tahun",
  "Gratis Pengiriman Sertifikat",
];

const persyaratan = [
  "KTP & CV (Curriculum Vitae)",
  "Pas Foto Background Merah",
  "Lulusan SMA — Pengalaman Kerja Minimal 10 Tahun",
  "Lulusan D3 — Pengalaman Kerja Minimal 3 Tahun",
  "Lulusan S1 — Pengalaman Kerja Minimal 1 Tahun",
  "Surat Pengalaman Kerja / Paklaring",
];

const batches = [
  { dates: "12 – 16 Juni 2026", slot: "Terbatas" },
  { dates: "20 – 24 Juni 2026", slot: "Terbatas" },
  { dates: "26 – 30 Juni 2026", slot: "Terbatas" },
];

const keunggulan = [
  {
    Icon: BadgeCheck,
    title: "Sertifikat Resmi BNSP",
    desc: "Diakui secara nasional sebagai bukti kompetensi profesional di bidang K3.",
  },
  {
    Icon: Monitor,
    title: "Training Online via Zoom",
    desc: "Belajar dari mana saja dengan instruktur berpengalaman secara live interactive.",
  },
  {
    Icon: Award,
    title: "Pendampingan Profesional",
    desc: "Tim instruktur bersertifikat siap membimbing hingga peserta lulus uji kompetensi.",
  },
];

export default function POPPage() {
  return (
    <div className="britsafe-site">
      <LandingHeader />

      <main>
        {/* Hero */}
        <section
          style={{
            background: "linear-gradient(135deg, #0d1b2a 0%, #1b365d 60%, #0d1b2a 100%)",
            padding: "80px 0 60px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 70% 50%, rgba(234,115,25,0.12) 0%, transparent 60%)",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: "700px" }}>
              <span
                style={{
                  display: "inline-block",
                  background: "var(--ajs-orange)",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "24px",
                }}
              >
                Diklat & Uji Kompetensi
              </span>
              <h1
                style={{
                  fontSize: "clamp(36px, 6vw, 64px)",
                  fontWeight: "900",
                  color: "white",
                  lineHeight: 1.1,
                  marginBottom: "8px",
                }}
              >
                Pengawas{" "}
                <span style={{ color: "var(--ajs-orange)" }}>Operasional</span>
                <br />
                Pertama
              </h1>
              <div
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: "900",
                  color: "white",
                  marginBottom: "24px",
                  letterSpacing: "2px",
                }}
              >
                (POP)
              </div>
              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.7,
                  marginBottom: "40px",
                  maxWidth: "560px",
                }}
              >
                Tingkatkan kompetensi dan raih pengakuan resmi BNSP untuk karir yang lebih profesional di bidang keselamatan operasional pertambangan.
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <a
                  href="/pelatihan/pop/daftar"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "white",
                    color: "var(--ajs-navy)",
                    padding: "16px 32px",
                    borderRadius: "8px",
                    fontWeight: "800",
                    fontSize: "16px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  Daftar Online Sekarang →
                </a>
                <a
                  href="#jadwal"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: "white",
                    padding: "16px 32px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "16px",
                    textDecoration: "none",
                    border: "2px solid rgba(255,255,255,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  Lihat Jadwal <ChevronRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Keunggulan */}
        <section className="section-padding" style={{ background: "white" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 56px" }}>
              <h2 className="britsafe-section-title">Mengapa Pilih Program Ini?</h2>
              <p className="britsafe-section-subtitle">
                Dirancang untuk memenuhi standar kompetensi nasional dengan metode pembelajaran yang efektif dan fleksibel.
              </p>
            </div>
            <div className="britsafe-grid">
              {keunggulan.map(({ Icon, title, desc }) => (
                <article
                  key={title}
                  className="britsafe-card"
                  style={{ borderTop: "4px solid var(--ajs-orange)" }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: "rgba(234,115,25,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <Icon size={28} style={{ color: "var(--ajs-orange)" }} />
                  </div>
                  <h3 className="britsafe-card__title">{title}</h3>
                  <p className="britsafe-card__copy">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Fasilitas & Persyaratan */}
        <section className="section-padding britsafe-gray">
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "32px",
              }}
            >
              {/* Fasilitas */}
              <div className="britsafe-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                  <Award size={24} style={{ color: "var(--ajs-orange)" }} />
                  <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--ajs-navy)" }}>
                    Fasilitas
                  </h3>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                  {fasilitas.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "var(--ajs-muted)" }}>
                      <CheckCircle size={18} style={{ color: "#22c55e", flexShrink: 0, marginTop: "2px" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Persyaratan */}
              <div className="britsafe-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                  <FileText size={24} style={{ color: "var(--ajs-orange)" }} />
                  <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--ajs-navy)" }}>
                    Persyaratan
                  </h3>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                  {persyaratan.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", color: "var(--ajs-muted)" }}>
                      <CheckCircle size={18} style={{ color: "var(--ajs-orange)", flexShrink: 0, marginTop: "2px" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Jadwal & Investasi */}
        <section id="jadwal" className="section-padding" style={{ background: "white" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 56px" }}>
              <h2 className="britsafe-section-title">Jadwal & Investasi</h2>
              <p className="britsafe-section-subtitle">
                Pilih batch yang sesuai jadwal Anda. Kuota terbatas, segera daftarkan diri Anda.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "32px",
                alignItems: "start",
              }}
            >
              {/* Jadwal */}
              <div className="britsafe-card">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                  <Calendar size={24} style={{ color: "var(--ajs-orange)" }} />
                  <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--ajs-navy)" }}>
                    Batch Juni 2026
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {batches.map((batch) => (
                    <div
                      key={batch.dates}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 20px",
                        background: "var(--ajs-gray)",
                        borderRadius: "8px",
                        borderLeft: "4px solid var(--ajs-orange)",
                      }}
                    >
                      <span style={{ fontWeight: "600", color: "var(--ajs-navy)", fontSize: "15px" }}>
                        {batch.dates}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "var(--ajs-orange)",
                          background: "rgba(234,115,25,0.1)",
                          padding: "4px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        {batch.slot}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investasi */}
              <div
                className="britsafe-card"
                style={{
                  background: "linear-gradient(135deg, #0d1b2a, #1b365d)",
                  color: "white",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "rgba(255,255,255,0.7)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Investasi
                </h3>
                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "900",
                    color: "var(--ajs-orange)",
                    marginBottom: "8px",
                    lineHeight: 1,
                  }}
                >
                  Rp 3.500.000
                </div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "32px" }}>
                  Per peserta · Sudah termasuk semua fasilitas
                </p>
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    marginBottom: "32px",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.8,
                  }}
                >
                  <strong style={{ color: "white" }}>Transfer via BNI</strong><br />
                  No. Rekening: <strong style={{ color: "var(--ajs-orange)" }}>2079200936</strong><br />
                  a.n. Arkama Jaya Sertifikasi
                </div>
                <a
                  href="/pelatihan/pop/daftar"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "var(--ajs-orange)",
                    color: "white",
                    padding: "16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "16px",
                    textDecoration: "none",
                    marginBottom: "10px"
                  }}
                >
                  Daftar Online →
                </a>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  Ada pertanyaan? Chat WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: "var(--ajs-orange)",
            padding: "64px 0",
          }}
        >
          <div className="container" style={{ textAlign: "center" }}>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: "900",
                color: "white",
                marginBottom: "16px",
              }}
            >
              Siap Raih Sertifikat POP Anda?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px", marginBottom: "36px" }}>
              Daftar langsung secara online atau hubungi admin kami untuk informasi lebih lanjut.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="/pelatihan/pop/daftar"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "white",
                  color: "var(--ajs-orange)",
                  padding: "16px 36px",
                  borderRadius: "8px",
                  fontWeight: "800",
                  fontSize: "16px",
                  textDecoration: "none",
                }}
              >
                Daftar Online Sekarang →
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  padding: "16px 36px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "16px",
                  textDecoration: "none",
                }}
              >
                <Phone size={20} />
                Hubungi Admin
              </a>
              <div style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>
                0823 9679 2362
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__bottom">
            <p>
              &copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua
              hak dilindungi.
            </p>
            <p style={{ opacity: 0.5 }}>Excellence in Safety Certification</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
