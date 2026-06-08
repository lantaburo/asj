import Image from "next/image";
import { LandingHeader } from "@/features/landing-page/landing-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami | AJS Learning Hub",
  description:
    "Kenali tim di balik Arkama Jaya Sertifikasi — pemimpin berpengalaman yang berdedikasi untuk meningkatkan standar keselamatan kerja di Indonesia.",
};

const team = [
  {
    name: "Asril, S.T",
    role: "Direktur Utama / Founder",
    bio: "Memimpin Arkama Jaya Sertifikasi sejak awal berdiri dengan visi membangun ekosistem pelatihan K3 yang modern, terintegrasi, dan berdampak nyata bagi industri Indonesia.",
    photo: "/images/asril.jpeg",
    translateY: "5%",
    initials: "AS",
  },
  {
    name: "Nasrul Haq, S.Sos, MPA",
    role: "Komisaris",
    bio: "Membawa perspektif tata kelola dan kebijakan publik dalam pengawasan strategis perusahaan, memastikan setiap langkah organisasi sejalan dengan kepentingan pemangku jabatan.",
    photo: "/images/nasrul.jpeg",
    zoom: 1.3,
    initials: "NH",
  },
  {
    name: "Mujahida Ahmad, M.Pd",
    role: "Digital Strategist",
    bio: "Merancang dan mengeksekusi strategi digital yang memperluas jangkauan AJS Learning Hub, menghubungkan lebih banyak profesional dengan program sertifikasi berkualitas.",
    photo: "/images/mujahida.jpeg",
    zoom: 1.2,
    translateY: "5%",
    initials: "MA",
  },
];

export default function TentangKamiPage() {
  return (
    <div className="britsafe-site">
      <LandingHeader />

      <main>
        <section className="britsafe-hero" style={{ minHeight: "360px" }}>
          <div className="container britsafe-hero__grid">
            <div className="britsafe-hero__content">
              <span className="britsafe-hero__kicker">Tentang Kami</span>
              <h1 className="britsafe-hero__title">
                Tim di Balik Arkama Jaya Sertifikasi
              </h1>
              <p className="britsafe-hero__lead">
                Kami adalah tim profesional yang berdedikasi membangun standar
                keselamatan kerja yang lebih baik di Indonesia melalui pelatihan
                dan sertifikasi K3 yang modern dan terpercaya.
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding" style={{ background: "white" }}>
          <div className="container">
            <div
              style={{
                textAlign: "center",
                maxWidth: "800px",
                margin: "0 auto 64px",
              }}
            >
              <h2 className="britsafe-section-title">Profil Perusahaan</h2>
              <p
                className="britsafe-section-subtitle"
                style={{ lineHeight: 1.8 }}
              >
                Arkama Jaya Sertifikasi adalah lembaga pelatihan dan sertifikasi
                K3 yang berizin dan terakreditasi resmi oleh KEMENAKER RI dan
                BNSP. Kami hadir untuk menjawab kebutuhan industri akan tenaga
                kerja yang kompeten, aman, dan tersertifikasi secara nasional.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "32px",
                maxWidth: "900px",
                margin: "0 auto",
              }}
            >
              {[
                {
                  label: "Visi",
                  text: "Menjadi lembaga sertifikasi K3 terdepan yang mendorong terciptanya lingkungan kerja yang aman, produktif, dan berstandar internasional di seluruh Indonesia.",
                },
                {
                  label: "Misi",
                  text: "Menyelenggarakan pelatihan berkualitas tinggi dengan instruktur berpengalaman, sistem manajemen yang transparan, dan sertifikasi yang diakui secara nasional.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="britsafe-card"
                  style={{ borderTop: "4px solid var(--ajs-orange)" }}
                >
                  <h3
                    className="britsafe-card__title"
                    style={{ color: "var(--ajs-navy)" }}
                  >
                    {item.label}
                  </h3>
                  <p
                    className="britsafe-card__copy"
                    style={{ lineHeight: 1.8 }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding britsafe-gray">
          <div className="container">
            <div
              style={{
                textAlign: "center",
                maxWidth: "800px",
                margin: "0 auto 64px",
              }}
            >
              <h2 className="britsafe-section-title">Pimpinan Kami</h2>
              <p className="britsafe-section-subtitle">
                Dipimpin oleh individu-individu berpengalaman yang berkomitmen
                pada kualitas, integritas, dan kemajuan industri K3 nasional.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "32px",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              {team.map((member) => (
                <div
                  key={member.name}
                  className="britsafe-card"
                  style={{ textAlign: "center", padding: "48px 32px" }}
                >
                  <div
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      margin: "0 auto 24px",
                      border: "4px solid var(--ajs-border)",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      style={{
                        objectFit: "cover",
                        objectPosition: "top",
                        transform: member.zoom && member.translateY
                          ? `scale(${member.zoom}) translateY(${member.translateY})`
                          : member.zoom
                          ? `scale(${member.zoom}) translateY(-22%)`
                          : member.translateY
                          ? `translateY(${member.translateY})`
                          : "scale(1)",
                        transformOrigin: "top center",
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "var(--ajs-navy)",
                      marginBottom: "8px",
                    }}
                  >
                    {member.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--ajs-orange)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "20px",
                    }}
                  >
                    {member.role}
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "var(--ajs-muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding" style={{ background: "white" }}>
          <div
            className="container"
            style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}
          >
            <h2
              className="britsafe-section-title"
              style={{ marginBottom: "20px" }}
            >
              Ingin Bergabung atau Bekerjasama?
            </h2>
            <p
              className="britsafe-section-subtitle"
              style={{ marginBottom: "40px" }}
            >
              Hubungi tim kami untuk informasi kemitraan, pelatihan in-house,
              atau pertanyaan lainnya.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:cs@arkamajayasertifikasi.id" className="btn btn-primary">
                Hubungi Kami
              </a>
              <a href="/#programs" className="btn btn-outline">
                Lihat Program
              </a>
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
