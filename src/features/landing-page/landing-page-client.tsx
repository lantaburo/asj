import Link from "next/link";
import { AJSLogo } from "@/features/landing-page/logo";

import {
  countAvailableSeats,
  countOpenBatches,
  formatCurrency,
  formatDateRange
} from "@/features/landing-page/landing-page.service";
import { getPublicPrograms } from "@/features/programs/program.service";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function summarizeCategories(
  programs: Awaited<ReturnType<typeof getPublicPrograms>>
) {
  const categoryMap = new Map<
    string,
    {
      programCount: number;
      batchCount: number;
      seats: number;
    }
  >();

  for (const program of programs) {
    const key = formatLabel(program.category);
    const existing = categoryMap.get(key) ?? {
      programCount: 0,
      batchCount: 0,
      seats: 0
    };

    existing.programCount += 1;
    existing.batchCount += program.openBatches.length;
    existing.seats += program.openBatches.reduce(
      (total, batch) => total + batch.quotaRemaining,
      0
    );

    categoryMap.set(key, existing);
  }

  return Array.from(categoryMap.entries())
    .map(([label, summary]) => ({
      label,
      ...summary
    }))
    .sort((left, right) => right.batchCount - left.batchCount)
    .slice(0, 4);
}

function summarizeIndustries(
  programs: Awaited<ReturnType<typeof getPublicPrograms>>
) {
  const industryMap = new Map<
    string,
    {
      programCount: number;
      batchCount: number;
    }
  >();

  for (const program of programs) {
    const existing = industryMap.get(program.industryType) ?? {
      programCount: 0,
      batchCount: 0
    };

    existing.programCount += 1;
    existing.batchCount += program.openBatches.length;

    industryMap.set(program.industryType, existing);
  }

  return Array.from(industryMap.entries())
    .map(([label, summary]) => ({
      label,
      ...summary
    }))
    .sort((left, right) => right.programCount - left.programCount)
    .slice(0, 4);
}

function getUpcomingBatches(
  programs: Awaited<ReturnType<typeof getPublicPrograms>>
) {
  return programs
    .flatMap((program) =>
      program.openBatches.map((batch) => ({
        ...batch,
        programTitle: program.title,
        categoryLabel: formatLabel(program.category),
        industryType: program.industryType
      }))
    )
    .sort(
      (left, right) =>
        new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
    );
}

const commitments = [
  "Program dan batch mengambil data dari satu source of truth.",
  "Jadwal yang tampil ke publik tetap selaras dengan kapasitas operasional.",
  "Tim admin dan verifikator bekerja di workspace internal yang dijaga role."
] as const;

const journeySteps = [
  {
    title: "Katalog Pelatihan",
    copy: "Program, batch, harga, dan sisa kuota tampil dari data operasional yang sama."
  },
  {
    title: "Flow Pendaftaran",
    copy: "Landing, magic link, enrollment, dan attendance dirangkai tanpa memecah sistem."
  },
  {
    title: "Panel Internal",
    copy: "Master data, sertifikasi, dan verifikasi berjalan pada workspace yang terkontrol."
  }
] as const;

export async function LandingPageClient() {
  const programs = await getPublicPrograms();
  const openBatches = countOpenBatches(programs);
  const availableSeats = countAvailableSeats(programs);
  const categorySummaries = summarizeCategories(programs);
  const industrySummaries = summarizeIndustries(programs);
  const upcomingBatches = getUpcomingBatches(programs);
  const featuredPrograms = [...programs]
    .sort((left, right) => right.openBatches.length - left.openBatches.length)
    .slice(0, 3);
  const leadBatch = upcomingBatches[0] ?? null;

  return (
    <div className="britsafe-site">
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <nav className="britsafe-nav">
            <a href="#programs">Programs</a>
            <a href="#jadwal">Schedule</a>
            <a href="#cara-kerja">How it Works</a>
            <Link href="/masuk" className="britsafe-btn-auth">
              Workspace Internal
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="britsafe-hero">
          <div className="container">
            <div className="britsafe-hero__content">
              <span className="britsafe-hero__kicker">Arkama Jaya Sertifikasi Excellence</span>
              <h1 className="britsafe-hero__title">
                Pelatihan K3 Terintegrasi dengan Sistem Operasional Tervalidasi
              </h1>
              <p className="britsafe-hero__lead">
                ARKAMA JAYA SERTIFIKASI Learning Hub menghubungkan katalog publik langsung dengan data operasional real-time. 
                Dapatkan informasi batch, kuota, dan sertifikasi yang akurat dalam satu platform terpadu.
              </p>
              <div className="britsafe-hero__actions">
                <a href="#programs" className="btn btn-primary">
                  Lihat Semua Program
                </a>
                <a href="#jadwal" className="btn btn-outline">
                  Jadwal Batch Terdekat
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="britsafe-stats">
          <div className="container britsafe-stats__container">
            <div className="stat-item">
              <strong>{programs.length}</strong>
              <span>Program Aktif</span>
            </div>
            <div className="stat-item">
              <strong>{openBatches}</strong>
              <span>Batch Terbuka</span>
            </div>
            <div className="stat-item">
              <strong>{availableSeats}</strong>
              <span>Kursi Tersedia</span>
            </div>
          </div>
        </section>

        <section id="categories" className="section-padding" style={{ background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
              <h2 className="britsafe-section-title">Telusuri Berdasarkan Kategori</h2>
              <p className="britsafe-section-subtitle">
                Pilih bidang spesialisasi yang sesuai dengan kebutuhan pengembangan profesional Anda.
              </p>
            </div>
            <div className="britsafe-grid">
              {categorySummaries.map((item) => (
                <article key={item.label} className="britsafe-card">
                  <span className="britsafe-card__category">Kategori</span>
                  <h3 className="britsafe-card__title">{item.label}</h3>
                  <p className="britsafe-card__copy">
                    {item.programCount} program tersedia dengan total {item.batchCount} batch aktif saat ini.
                  </p>
                  <a href="#programs" className="britsafe-card__link">
                    Lihat Program
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="jadwal" className="section-padding britsafe-gray">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
              <h2 className="britsafe-section-title">Jadwal Pelatihan Mendatang</h2>
              <p className="britsafe-section-subtitle">
                Daftar batch yang tersedia untuk pendaftaran langsung. Data sinkron dengan operasional internal.
              </p>
            </div>
            
            {upcomingBatches.length === 0 ? (
              <div className="empty-state">Belum ada batch dengan status OPEN saat ini.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Program & Batch</th>
                      <th>Tanggal</th>
                      <th>Instruktur</th>
                      <th>Biaya</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBatches.slice(0, 5).map((batch) => (
                      <tr key={batch.id}>
                        <td data-label="Program & Batch">
                          <span className="schedule-title">{batch.programTitle}</span>
                          <span className="schedule-meta">{batch.categoryLabel} • {batch.industryType}</span>
                        </td>
                        <td data-label="Tanggal">
                          {formatDateRange(batch.startDate, batch.endDate)}
                        </td>
                        <td data-label="Instruktur">
                          {batch.instructorName ?? "TBA"}
                        </td>
                        <td data-label="Biaya">
                          <span className="schedule-price">{formatCurrency(batch.price)}</span>
                        </td>
                        <td data-label="Aksi">
                          <Link href="/daftar" className="schedule-btn">
                            Daftar Sekarang
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section id="programs" className="section-padding" style={{ background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
              <h2 className="britsafe-section-title">Program Unggulan</h2>
              <p className="britsafe-section-subtitle">
                Kurasi program pelatihan yang paling diminati dan siap untuk diikuti.
              </p>
            </div>
            
            <div className="britsafe-grid">
              {featuredPrograms.map((program) => (
                <article key={program.id} className="britsafe-card">
                  <span className="britsafe-card__category">{formatLabel(program.category)}</span>
                  <h3 className="britsafe-card__title">{program.title}</h3>
                  <p className="britsafe-card__copy">
                    {program.description ?? "Deskripsi program yang komprehensif untuk mendukung kompetensi Anda di bidang K3."}
                  </p>
                  <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--ajs-navy)', fontWeight: '600' }}>
                    {program.openBatches.length} Batch Tersedia
                  </div>
                  <a href="#jadwal" className="britsafe-card__link">
                    Cek Jadwal
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="section-padding britsafe-gray">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
              <h2 className="britsafe-section-title">Bagaimana Kami Bekerja</h2>
              <p className="britsafe-section-subtitle">
                Sistem pendaftaran yang transparan dan terintegrasi dari awal hingga sertifikasi.
              </p>
            </div>
            <div className="britsafe-grid">
              {journeySteps.map((step, index) => (
                <article key={step.title} className="britsafe-card" style={{ borderTop: '4px solid var(--ajs-orange)', paddingTop: '60px' }}>
                  <span style={{ fontSize: '64px', fontWeight: '900', color: 'rgba(27, 54, 93, 0.04)', position: 'absolute', top: '20px', left: '30px' }}>
                    0{index + 1}
                  </span>
                  <h3 className="britsafe-card__title" style={{ position: 'relative', zIndex: 2 }}>{step.title}</h3>
                  <p className="britsafe-card__copy" style={{ position: 'relative', zIndex: 2, fontSize: '15px', color: 'var(--ajs-muted)' }}>{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__grid">
            <div className="footer-col" style={{ gridColumn: 'span 2' }}>
              <h4 style={{ color: 'white', marginBottom: '24px' }}>ARKAMA JAYA SERTIFIKASI</h4>
              <p style={{ fontSize: '15px', opacity: 0.7, lineHeight: 1.8, maxWidth: '400px' }}>
                Penyedia pelatihan dan sertifikasi K3 terkemuka dengan sistem manajemen yang modern dan terintegrasi. 
                Berdedikasi untuk meningkatkan standar keselamatan industri di Indonesia.
              </p>
            </div>
            <div className="footer-col">
              <h4>Layanan</h4>
              <ul>
                <li><a href="#programs">Semua Program</a></li>
                <li><a href="#jadwal">Jadwal Pelatihan</a></li>
                <li><a href="/daftar">Alur Pendaftaran</a></li>
                <li><a href="/masuk">Portal Internal</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Hubungi Kami</h4>
              <ul style={{ opacity: 0.7, fontSize: '14px', lineHeight: 2 }}>
                <li>Email: info@arkamajaya.co.id</li>
                <li>WhatsApp: +62 812 3456 7890</li>
                <li>Gedung Arkama, Lt. 5, Jakarta</li>
              </ul>
            </div>
          </div>
          <div className="britsafe-footer__bottom">
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua hak dilindungi.</p>
            <p style={{ opacity: 0.5 }}>Excellence in Safety Certification</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
