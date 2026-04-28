import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSessionUser, canManageMasterData } from "@/features/auth/auth.service";

export const dynamic = "force-dynamic";

export default async function AdminMasterDataHubPage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/masuk?next=/admin/master-data");
  }

  if (!canManageMasterData(currentUser.role)) {
    redirect("/admin");
  }

  const sections = [
    {
      title: "Manajemen Program",
      description: "Lihat dan kelola seluruh program pelatihan yang telah dibuat.",
      href: "/admin/buat-program", // Usually links to a list, we'll route to buat-program for now
      icon: "📚"
    },
    {
      title: "Bank Unit Skema (SKKNI)",
      description: "Kelola standar kompetensi (SKKNI/BNSP) beserta unit-unit asessmennya.",
      href: "/admin/unit-skema",
      icon: "📋"
    },
    {
      title: "Daftar Instruktur & Asesor",
      description: "Database tenaga pengajar dan asesor internal maupun eksternal.",
      href: "/admin/instruktur-asesor",
      icon: "👥"
    },
    {
      title: "Daftar Kelas (Classroom)",
      description: "Daftar ruangan atau meeting room untuk jadwal pelatihan.",
      href: "/admin/classroom",
      icon: "🏢"
    },
    {
      title: "Pengaturan Sertifikat Internal",
      description: "Konfigurasi template PDF, tanda tangan digital, dan passing grade.",
      href: "/admin/pengaturan-sertifikat",
      icon: "🎓"
    }
  ];

  return (
    <div style={{ display: "grid", gap: "40px" }}>
      <section
        className="britsafe-card"
        style={{ padding: "40px", borderTop: "4px solid var(--ajs-blue)" }}
      >
        <span className="britsafe-card__category">Master Data Hub</span>
        <h1
          className="britsafe-card__title"
          style={{ fontSize: "28px", marginTop: "16px", marginBottom: "16px" }}
        >
          Pusat Data Pelatihan
        </h1>
        <p
          className="britsafe-card__copy"
          style={{ maxWidth: "860px", fontSize: "16px" }}
        >
          Halaman ini adalah pusat referensi untuk semua data yang berhubungan dengan pelatihan. 
          Anda dapat mengakses dan mengelola daftar entitas secara spesifik di bawah ini.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px"
        }}
      >
        {sections.map((section) => (
          <article
            key={section.title}
            className="britsafe-card"
            style={{ padding: "24px", display: "flex", flexDirection: "column" }}
          >
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>{section.icon}</div>
            <h3 style={{ fontSize: "18px", color: "var(--ajs-navy)", margin: "0 0 12px 0" }}>
              {section.title}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--ajs-muted)", margin: "0 0 24px 0", flex: 1 }}>
              {section.description}
            </p>
            {section.href !== "#" ? (
              <Link
                href={section.href}
                className="cta-secondary"
                style={{ textAlign: "center", textDecoration: "none" }}
              >
                Kelola Data
              </Link>
            ) : (
              <button
                className="cta-secondary"
                style={{ textAlign: "center", opacity: 0.5, cursor: "not-allowed" }}
                disabled
              >
                Segera Hadir
              </button>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
