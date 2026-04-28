import Link from "next/link";
import { BookOpen, UserPlus, LayoutDashboard, ShieldCheck, Award, Building, Hexagon, Zap, Triangle, Box, Diamond, Factory, Mountain, ChevronDown, Pickaxe } from "lucide-react";
import { AJSLogo } from "@/features/landing-page/logo";
import { CertificateChecker } from "@/features/landing-page/certificate-checker";
import { logger } from "@/lib/logger";

import {
  compareDateStrings,
  countAvailableSeats,
  countOpenBatches,
  formatCurrency,
  formatDateRange
} from "@/features/landing-page/landing-page.service";
import { getPublicPrograms } from "@/features/programs/program.service";
import { LandingHeader } from "./landing-header";

function formatLabel(value: string) {
  if (!value.includes("_")) {
    return value;
  }

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
    const key = formatLabel(program.categoryLabel);
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
        categoryLabel: formatLabel(program.categoryLabel),
        industryType: program.industryType
      }))
    )
    .sort(
      (left, right) =>
        compareDateStrings(left.startDate, right.startDate)
    );
}

const journeySteps = [
  {
    title: "Pilih Program Pelatihan",
    copy: "Temukan berbagai program sertifikasi K3 sesuai kebutuhan industri Anda. Jadwal dan ketersediaan kuota selalu diperbarui secara real-time.",
    Icon: BookOpen
  },
  {
    title: "Daftar dengan Mudah",
    copy: "Proses registrasi yang terintegrasi dan transparan. Peserta langsung mendapatkan akses ke dasbor personal untuk manajemen kehadiran.",
    Icon: UserPlus
  },
  {
    title: "Raih Sertifikasi Resmi",
    copy: "Ikuti pelatihan bersama instruktur profesional dan berpengalaman. Setelah lulus evaluasi, sertifikat resmi diterbitkan untuk menunjang karir Anda.",
    Icon: Award
  }
] as const;

const partnersData = [
  { name: "IMIP Morowali", Icon: Factory, color: "#C1272D" },
  { name: "Vale Indonesia", Icon: Mountain, color: "#007D51" },
  { name: "Pertamina Energi", Icon: Hexagon, color: "#1E4B9C" },
  { name: "PLN (Persero)", Icon: Zap, color: "#009B91" },
  { name: "Freeport Indonesia", Icon: Pickaxe, color: "#D4A017" },
  { name: "WIKA Karya", Icon: Triangle, color: "#2E5EAA" },
  { name: "Semen Indonesia", Icon: Box, color: "#E02020" },
  { name: "Krakatau Steel", Icon: Diamond, color: "#8E9196" },
] as const;

const faqsData = [
  {
    question: "Apakah sertifikat yang diterbitkan resmi?",
    answer: "Ya, semua pelatihan kami berafiliasi dan terakreditasi resmi oleh institusi terkait seperti KEMENAKER RI dan BNSP, sehingga sertifikat yang diterbitkan valid dan diakui secara nasional."
  },
  {
    question: "Bagaimana cara mendaftar pelatihan?",
    answer: "Anda dapat memilih program dari Katalog Pelatihan, cek jadwal Batch yang tersedia, lalu klik 'Daftar Sekarang'. Anda akan dipandu melalui alur pendaftaran terintegrasi kami."
  },
  {
    question: "Apakah tersedia pelatihan In-House untuk perusahaan?",
    answer: "Tentu. Kami menyediakan pelatihan In-House yang dapat disesuaikan dengan kebutuhan dan jadwal spesifik perusahaan Anda. Silakan hubungi tim layanan pelanggan kami untuk konsultasi lebih lanjut."
  },
  {
    question: "Metode pembayaran apa saja yang diterima?",
    answer: "Kami menerima berbagai metode pembayaran termasuk transfer bank (Virtual Account), kartu kredit, dan pembayaran B2B/Corporate Invoicing untuk perusahaan mitra."
  }
];

export function LandingPageClient({ 
  programs, 
  totalParticipants 
}: { 
  programs: Awaited<ReturnType<typeof getPublicPrograms>>,
  totalParticipants: number
}) {
    const openBatches = countOpenBatches(programs);
    const availableSeats = countAvailableSeats(programs);
    const categorySummaries = summarizeCategories(programs);
    const upcomingBatches = getUpcomingBatches(programs);
    const featuredPrograms = [...programs]
      .sort((left, right) => right.openBatches.length - left.openBatches.length)
      .slice(0, 3);
    const scheduleRows = upcomingBatches.slice(0, 5).map((batch) => ({
      ...batch,
      dateLabel: formatDateRange(batch.startDate, batch.endDate),
      priceLabel: formatCurrency(batch.price)
    }));

    return (
      <div className="britsafe-site">
        <LandingHeader />

        <main>
          <section className="britsafe-hero">
            <div className="container britsafe-hero__grid">
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
              <div className="stat-item">
                <strong>{totalParticipants}</strong>
                <span>Peserta Terdaftar</span>
              </div>
            </div>
          </section>


          <section className="section-padding" style={{ background: 'white', padding: '40px 0', borderBottom: '1px solid var(--ajs-border)' }}>
            <div className="container">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ajs-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Dipercaya & Terakreditasi Oleh
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '48px', alignItems: 'center', opacity: 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '700' }}>
                    <ShieldCheck size={32} style={{ color: 'var(--ajs-navy)' }} />
                    KEMENAKER RI
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '700' }}>
                    <Award size={32} style={{ color: 'var(--ajs-navy)' }} />
                    BNSP
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '700' }}>
                    <Building size={32} style={{ color: 'var(--ajs-navy)' }} />
                    ISO 9001:2015
                  </div>
                </div>
              </div>
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
                    <span className="britsafe-card__category">{formatLabel(program.categoryLabel)}</span>
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

          <section id="categories" className="section-padding britsafe-gray">
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

          <section id="jadwal" className="section-padding" style={{ background: 'white' }}>
            <div className="container">
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
                <h2 className="britsafe-section-title">Jadwal Pelatihan Mendatang</h2>
                <p className="britsafe-section-subtitle">
                  Daftar batch yang tersedia untuk pendaftaran langsung. Data sinkron dengan operasional internal.
                </p>
              </div>

              {scheduleRows.length === 0 ? (
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
                      {scheduleRows.map((batch) => (
                        <tr key={batch.id}>
                          <td data-label="Program & Batch">
                            <span className="schedule-title">{batch.programTitle}</span>
                            <span className="schedule-meta">{batch.categoryLabel} • {batch.industryType}</span>
                          </td>
                          <td data-label="Tanggal">
                            {batch.dateLabel}
                          </td>
                          <td data-label="Instruktur">
                            {batch.instructorName ?? "TBA"}
                          </td>
                          <td data-label="Biaya">
                            <span className="schedule-price">{batch.priceLabel}</span>
                          </td>
                          <td data-label="Aksi">
                            <Link href={`/daftar?batchId=${batch.id}`} className="schedule-btn">
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

          <section className="section-padding britsafe-gray">
            <div className="container" style={{ overflow: 'hidden' }}>
              <style>{`
                .partner-logo {
                  display: flex;
                  align-items: center;
                  gap: 20px;
                  font-size: 28px;
                  font-weight: 800;
                  color: var(--ajs-muted);
                  opacity: 0.6;
                  transition: all 0.3s ease;
                  cursor: default;
                  filter: grayscale(100%);
                  white-space: nowrap;
                }
                .partner-logo:hover {
                  filter: grayscale(0%);
                  opacity: 1;
                  color: var(--hover-color) !important;
                }
                @keyframes scrollRight {
                  0% { transform: translateX(-50%); }
                  100% { transform: translateX(0); }
                }
                @keyframes scrollLeft {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-container {
                  display: flex;
                  flex-direction: column;
                  gap: 64px;
                  width: 100%;
                  position: relative;
                }
                .marquee-row {
                  display: flex;
                  gap: 80px;
                  width: max-content;
                }
                .marquee-row.right {
                  animation: scrollRight 240s linear infinite;
                }
                .marquee-row.left {
                  animation: scrollLeft 240s linear infinite;
                }
                .marquee-row:hover {
                  animation-play-state: paused;
                }
              `}</style>
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
                <h2 className="britsafe-section-title" style={{ fontSize: '28px' }}>Mitra Perusahaan Kami</h2>
                <p className="britsafe-section-subtitle" style={{ fontSize: '16px' }}>
                  Berbagai perusahaan multinasional dan BUMN telah mempercayakan pelatihan K3 kepada kami.
                </p>
              </div>
            
              <div className="marquee-container">
                <div className="marquee-row right">
                  {[...partnersData.slice(0, 4), ...partnersData.slice(0, 4), ...partnersData.slice(0, 4), ...partnersData.slice(0, 4)].map((partner, i) => {
                    const Icon = partner.Icon;
                    return (
                      <div 
                        key={partner.name + i}
                        className="partner-logo"
                        style={{ '--hover-color': partner.color } as React.CSSProperties}
                      >
                        <Icon size={48} style={{ color: 'inherit' }} />
                        {partner.name}
                      </div>
                    );
                  })}
                </div>
                <div className="marquee-row left">
                  {[...partnersData.slice(4, 8), ...partnersData.slice(4, 8), ...partnersData.slice(4, 8), ...partnersData.slice(4, 8)].map((partner, i) => {
                    const Icon = partner.Icon;
                    return (
                      <div 
                        key={partner.name + i}
                        className="partner-logo"
                        style={{ '--hover-color': partner.color } as React.CSSProperties}
                      >
                        <Icon size={48} style={{ color: 'inherit' }} />
                        {partner.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section id="cara-kerja" className="section-padding" style={{ background: 'white' }}>
            <div className="container">
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
                <h2 className="britsafe-section-title">Bagaimana Kami Bekerja</h2>
                <p className="britsafe-section-subtitle">
                  Sistem pendaftaran yang transparan dan terintegrasi dari awal hingga sertifikasi.
                </p>
              </div>
              <div className="britsafe-grid">
                {journeySteps.map((step, index) => {
                  const Icon = step.Icon;
                  return (
                  <article key={step.title} className="britsafe-card" style={{ borderTop: '4px solid var(--ajs-orange)', paddingTop: '60px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '24px', right: '24px', opacity: 0.05, color: 'var(--ajs-navy)' }}>
                      <Icon size={80} />
                    </div>
                    <span style={{ fontSize: '64px', fontWeight: '900', color: 'rgba(27, 54, 93, 0.04)', position: 'absolute', top: '20px', left: '30px' }}>
                      0{index + 1}
                    </span>
                    <h3 className="britsafe-card__title" style={{ position: 'relative', zIndex: 2 }}>{step.title}</h3>
                    <p className="britsafe-card__copy" style={{ position: 'relative', zIndex: 2, fontSize: '15px', color: 'var(--ajs-muted)' }}>{step.copy}</p>
                  </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="faq" className="section-padding britsafe-gray">
            <div className="container">
              <style>{`
                .faq-details {
                  background: white;
                  border-radius: 8px;
                  margin-bottom: 16px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                  overflow: hidden;
                }
                .faq-summary {
                  padding: 24px;
                  font-weight: 700;
                  font-size: 16px;
                  color: var(--ajs-navy);
                  cursor: pointer;
                  list-style: none;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .faq-summary::-webkit-details-marker {
                  display: none;
                }
                .faq-details[open] .faq-summary {
                  border-bottom: 1px solid var(--ajs-border);
                }
                .faq-content {
                  padding: 24px;
                  color: var(--ajs-muted);
                  line-height: 1.6;
                  font-size: 15px;
                }
                .faq-icon {
                  transition: transform 0.3s ease;
                }
                .faq-details[open] .faq-icon {
                  transform: rotate(180deg);
                }
              `}</style>
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
                <h2 className="britsafe-section-title">Pertanyaan yang Sering Diajukan</h2>
                <p className="britsafe-section-subtitle">
                  Temukan jawaban untuk pertanyaan umum seputar program pelatihan dan sertifikasi kami.
                </p>
              </div>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {faqsData.map((faq, index) => (
                  <details key={index} className="faq-details">
                    <summary className="faq-summary">
                      {faq.question}
                      <ChevronDown className="faq-icon" size={20} />
                    </summary>
                    <div className="faq-content">
                      {faq.answer}
                    </div>
                  </details>
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
                <p style={{ fontSize: '15px', opacity: 0.7, lineHeight: 1.8, maxWidth: '400px', marginBottom: '24px' }}>
                  Penyedia pelatihan dan sertifikasi K3 terkemuka dengan sistem manajemen yang modern dan terintegrasi.
                  Berdedikasi untuk meningkatkan standar keselamatan industri di Indonesia.
                </p>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <a href="#" style={{ color: 'white', opacity: 0.7, transition: 'all 0.2s' }} className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" style={{ color: 'white', opacity: 0.7, transition: 'all 0.2s' }} className="social-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#" style={{ color: 'white', opacity: 0.7, transition: 'all 0.2s' }} className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" style={{ color: 'white', opacity: 0.7, transition: 'all 0.2s' }} className="social-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="footer-col">
                <h4>Layanan</h4>
                <ul>
                  <li><a href="#programs">Semua Program</a></li>
                  <li><a href="#jadwal">Jadwal Pelatihan</a></li>
                  <li><a href="/daftar">Alur Pendaftaran</a></li>
                  <li><a href="/peserta">Dashboard Peserta</a></li>
                  <li><a href="/masuk">Portal Internal</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Hubungi Kami</h4>
                <ul style={{ opacity: 0.7, fontSize: '14px', lineHeight: 2 }}>
                  <li><strong style={{ color: 'white' }}>Email:</strong> cs@arkamajayasertifikasi.id</li>
                  <li><strong style={{ color: 'white' }}>WhatsApp:</strong> +62 821-2345-6789 (Hunting)</li>
                  <li><strong style={{ color: 'white' }}>Kantor Pusat:</strong> Gedung Arkama Safety Lt. 5<br/>Jl. Jend. Sudirman Kav 10-11, Jakarta Selatan</li>
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
