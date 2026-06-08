import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/features/auth/auth.service";
import { AJSLogo } from "@/features/landing-page/logo";
import { PopDaftarClient } from "./pop-daftar-client";

export const dynamic = "force-dynamic";

async function getPOPBatches() {
  const program = await prisma.program.findFirst({
    where: { title: { contains: "POP" }, isActive: true },
    include: {
      batches: {
        where: { status: "OPEN" },
        orderBy: { startDate: "asc" },
        include: {
          _count: { select: { enrollments: true } }
        }
      }
    }
  });
  if (!program) return { programId: null, batches: [] };
  return {
    programId: program.id,
    batches: program.batches.map(b => ({
      id: b.id,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      quota: b.quota,
      quotaRemaining: Math.max(b.quota - b._count.enrollments, 0),
      price: b.price
    }))
  };
}

export default async function POPDaftarPage({ searchParams }: { searchParams: Promise<{ batchId?: string }> }) {
  const { batchId } = await searchParams;
  const currentUser = await getCurrentSessionUser();

  // If already logged in as admin, redirect to admin panel
  if (currentUser && currentUser.role !== "TRAINEE") {
    redirect("/admin/pelatihan/pop");
  }

  const { batches } = await getPOPBatches();

  const steps = [
    { num: 1, label: "Pilih Batch", desc: "Tentukan jadwal yang sesuai" },
    { num: 2, label: "Buat Akun", desc: "Daftar & login ke sistem" },
    { num: 3, label: "Bayar & Upload Dokumen", desc: "Transfer + lengkapi persyaratan" },
    { num: 4, label: "Verifikasi Admin", desc: "Kami konfirmasi keikutsertaan Anda" },
    { num: 5, label: "Ikuti Pelatihan", desc: "Hadir & selesaikan sertifikasi" },
  ];

  return (
    <div className="britsafe-site" style={{ background: "var(--ajs-gray)", minHeight: "100vh" }}>
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <nav className="britsafe-nav">
            <Link href="/pelatihan/pop" className="btn btn-outline" style={{ color: "var(--ajs-navy)", borderColor: "var(--ajs-border)" }}>
              ← Info Pelatihan POP
            </Link>
            <Link href="/masuk">Sudah Punya Akun</Link>
          </nav>
        </div>
      </header>

      <main style={{ padding: "60px 20px" }}>
        <div className="container" style={{ maxWidth: "860px" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ajs-orange)" }}>
              Daftar Pelatihan
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--ajs-navy)", margin: "8px 0 12px" }}>
              Pengawas Operasional Pertama (POP)
            </h1>
            <p style={{ fontSize: "16px", color: "var(--ajs-muted)", maxWidth: "560px", margin: "0 auto" }}>
              Diklat dan Uji Kompetensi bersertifikat BNSP. Ikuti langkah berikut untuk menyelesaikan pendaftaran Anda.
            </p>
          </div>

          {/* Step tracker */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
              gap: "4px",
              position: "relative"
            }}>
              {steps.map((step, i) => (
                <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative" }}>
                  {i < steps.length - 1 && (
                    <div style={{
                      position: "absolute",
                      top: "16px",
                      left: "50%",
                      width: "100%",
                      height: "2px",
                      background: i === 0 ? "var(--ajs-navy)" : "var(--ajs-border)",
                      zIndex: 0
                    }} />
                  )}
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "800",
                    background: i === 0 ? "var(--ajs-navy)" : "white",
                    color: i === 0 ? "white" : "var(--ajs-muted)",
                    border: `2px solid ${i === 0 ? "var(--ajs-navy)" : "var(--ajs-border)"}`,
                    position: "relative",
                    zIndex: 1
                  }}>
                    {step.num}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: i === 0 ? "var(--ajs-navy)" : "var(--ajs-muted)" }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--ajs-muted)", display: "none" }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px", alignItems: "start" }}>
            {/* Main Form */}
            <div>
              <PopDaftarClient
                batches={batches}
                initialBatchId={batchId ?? ""}
                currentUser={currentUser ? { id: currentUser.id, fullName: currentUser.fullName, email: currentUser.email } : null}
              />
            </div>

            {/* Sidebar: requirements & tips */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid var(--ajs-border)" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--ajs-navy)", margin: "0 0 16px" }}>
                  Persyaratan Dokumen
                </h3>
                {[
                  "KTP / Identitas Diri",
                  "CV (Curriculum Vitae)",
                  "Pas Foto Background Merah",
                  "Ijazah Terakhir",
                  "Surat Pengalaman Kerja / Paklaring",
                ].map((doc) => (
                  <div key={doc} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px", fontSize: "13px", color: "var(--ajs-text)" }}>
                    <span style={{ color: "var(--ajs-orange)", fontWeight: "700", flexShrink: 0 }}>✓</span>
                    {doc}
                  </div>
                ))}
                <p style={{ fontSize: "11px", color: "var(--ajs-muted)", marginTop: "12px", marginBottom: 0 }}>
                  Upload setelah mendaftar melalui Dashboard Peserta.
                </p>
              </div>

              <div style={{ background: "var(--ajs-navy)", borderRadius: "12px", padding: "24px", color: "white" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 8px" }}>Ada pertanyaan?</h3>
                <p style={{ fontSize: "13px", opacity: 0.8, margin: "0 0 16px" }}>
                  Hubungi admin kami via WhatsApp untuk informasi lebih lanjut.
                </p>
                <a
                  href={`https://wa.me/6282396792362?text=${encodeURIComponent("Halo, saya ingin mengetahui informasi pelatihan POP")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    background: "#25D366",
                    color: "white",
                    textDecoration: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    textAlign: "center"
                  }}
                >
                  Chat WhatsApp Admin
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
