"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

// Helper: convert datetime-local string (YYYY-MM-DDTHH:mm) to WITA ISO string
function toWita(localStr: unknown): string | null {
  if (!localStr || typeof localStr !== "string" || localStr.trim() === "") return null;
  // datetime-local doesn't have timezone info – we treat it as WITA (UTC+8)
  return `${localStr}:00+08:00`;
}

type ProgramOption = {
  id: string;
  title: string;
  isActive: boolean;
};

type BatchOption = {
  id: string;
  title?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  programTitle: string;
};

type ClassroomOption = {
  id: string;
  roomName: string;
  isAvailable: boolean;
  capacity: number;
};

type InternalMemberOption = {
  id: string;
  fullName: string;
  role: string;
  instructorLevel: string | null;
};

type UnitSchemaOption = {
  id: string;
  title: string;
  description: string;
  level: string;
};

type FlowStep = "program" | "batch" | "classroom" | "session" | "member";

type FlashState = {
  type: "success" | "error";
  message: string;
} | null;

type ApiErrorResponse = {
  error?: {
    message?: string;
    details?: {
      formErrors?: string[];
      fieldErrors?: Record<string, string[]>;
    };
  };
};

const PROGRAM_CATEGORIES = [
  "BNSP",
  "KEMENAKER",
  "INHOUSE",
  "SERTIFIKASI",
  "AUDIT",
  "LAINNYA"
] as const;

const INTERNAL_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "INSTRUCTOR",
  "ASSESSOR",
  "CLIENT_HR",
  "AUDITOR"
] as const;

const INSTRUCTOR_LEVELS = ["JUNIOR", "MADYA", "SENIOR", "MASTER"] as const;

const K3_FACILITIES_GROUPS = [
  {
    category: "1. Lingkungan & Area Belajar",
    items: [
      "Rasio Luas Ruangan: Minimal 1,5 - 2 meter persegi per peserta",
      "Pencahayaan: Minimal 300-500 lux",
      "Ventilasi & Suhu: Sistem AC 22-25°C",
      "Kedap Suara: Maksimal 45-50 dB",
      "Aksesibilitas: Fasilitas ramah disabilitas"
    ]
  },
  {
    category: "2. Peralatan Instruksional",
    items: [
      "Proyektor/Smart TV: Full HD, 3000 lumens",
      "Layar Proyektor: Proporsional untuk baris belakang (12pt)",
      "Papan Tulis/Whiteboard: Minimal 2 buah",
      "Flipchart: Tersedia",
      "Konektivitas: Wi-fi kecepatan tinggi & power outlet di tiap meja"
    ]
  },
  {
    category: "3. Alat Peraga & Praktik K3",
    items: [
      "APD: Set lengkap (Helm, Rompi, Sepatu Safety, Kacamata, Sarung Tangan)",
      "Manekin CPR: Kondisi higienis",
      "APAR: Berbagai jenis (CO2, Powder)",
      "Kotak P3K: Sesuai standar regulasi",
      "Safety Signages: Terpasang di dalam kelas"
    ]
  },
  {
    category: "4. Keselamatan Fasilitas",
    items: [
      "Jalur Evakuasi: Peta terpasang jelas",
      "Emergency Exit: Tidak terhalang",
      "Titik Kumpul: Ditandai jelas",
      "Detektor Asap & Sprinkler: Berfungsi"
    ]
  },
  {
    category: "5. Kenyamanan Peserta",
    items: [
      "Ergonomi: Kursi dengan sandaran punggung",
      "Meja: Luas permukaan cukup untuk laptop, modul, & alat tulis",
      "Stasiun Hidrasi: Akses mudah air minum",
      "Area Istirahat: Ruang terpisah"
    ]
  },
  {
    category: "6. Administrasi & Materi",
    items: [
      "Modul Pelatihan: Hardcopy/digital siap",
      "Stationery Kit: Pulpen, buku catatan, & highlighter",
      "Formulir Evaluasi: Feedback di akhir sesi"
    ]
  }
];

const FLOW_STEPS: Array<{
  key: FlowStep;
  label: string;
  hint: string;
}> = [
  {
    key: "program",
    label: "Step 1 · Program",
    hint: "Buat kerangka program terlebih dulu."
  },
  {
    key: "batch",
    label: "Step 2 · Batch & Lokasi",
    hint: "Batch ditautkan ke program."
  },
  {
    key: "session",
    label: "Step 3 · Session",
    hint: "Sesi harian dengan jam spesifik."
  },
  {
    key: "classroom",
    label: "Step 4 · Ruang Kelas (Master)",
    hint: "Daftarkan ruangan sebelum dipakai sesi."
  },
  {
    key: "member",
    label: "Step 5 · Instruktur (Master)",
    hint: "Daftarkan staf/instruktur baru."
  }
];

const INITIAL_FLASHES: Record<FlowStep, FlashState> = {
  program: null,
  batch: null,
  classroom: null,
  session: null,
  member: null
};

function getOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getRequiredString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function inferInitialStep(
  programs: ProgramOption[],
  batches: BatchOption[],
  classrooms: ClassroomOption[],
  internalMembers: InternalMemberOption[]
): FlowStep {
  if (programs.length === 0) return "program";
  if (batches.length === 0) return "batch";
  if (classrooms.length === 0) return "classroom";
  return "session";
}

function FlashBanner({ flash }: { flash: FlashState }) {
  if (!flash) return null;
  return (
    <div style={{
      marginTop: "12px",
      borderRadius: "var(--radius-sm)",
      padding: "10px 12px",
      fontSize: "13px",
      fontWeight: 600,
      border: flash.type === "success" ? "1px solid rgba(0,166,81,0.25)" : "1px solid rgba(227,30,36,0.25)",
      color: flash.type === "success" ? "var(--ajs-green)" : "var(--ajs-red)",
      background: flash.type === "success" ? "rgba(0,166,81,0.08)" : "rgba(227,30,36,0.08)"
    }}>
      {flash.message}
    </div>
  );
}

function StepButton({ label, hint, active, onClick }: { label: string; hint: string; active: boolean; onClick: () => void; }) {
  return (
    <button type="button" onClick={onClick} style={{
      textAlign: "left",
      border: active ? "1px solid rgba(244,121,32,0.4)" : "1px solid var(--ajs-border)",
      borderRadius: "var(--radius-sm)",
      padding: "12px",
      background: active ? "rgba(244,121,32,0.1)" : "white",
      display: "grid",
      gap: "4px"
    }}>
      <span style={{ fontSize: "13px", fontWeight: 700, color: active ? "var(--ajs-orange)" : "var(--ajs-navy)" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>{hint}</span>
    </button>
  );
}

export function MasterDataApiPanel({ programs, batches, classrooms, internalMembers, unitSchemas }: {
  programs: ProgramOption[];
  batches: BatchOption[];
  classrooms: ClassroomOption[];
  internalMembers: InternalMemberOption[];
  unitSchemas: UnitSchemaOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [selectedProgramCategory, setSelectedProgramCategory] = useState<string>(PROGRAM_CATEGORIES[0]);
  const [selectedMemberRole, setSelectedMemberRole] = useState<string>(INTERNAL_ROLES[2]);
  const [activeStep, setActiveStep] = useState<FlowStep>(() => inferInitialStep(programs, batches, classrooms, internalMembers));
  const [flashes, setFlashes] = useState<Record<FlowStep, FlashState>>(INITIAL_FLASHES);
  const [opsFlash, setOpsFlash] = useState<FlashState>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsFormVisible(true);
      if (e.detail?.step) setActiveStep(e.detail.step);
    };
    window.addEventListener("ajs-open-wizard", handleOpen);
    return () => window.removeEventListener("ajs-open-wizard", handleOpen);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("ajs_hide_master_wizard") !== "true") {
      setShowWizard(true);
    }
  }, []);

  function setStepFlash(step: FlowStep, value: FlashState) {
    setFlashes(prev => ({ ...prev, [step]: value }));
  }

  function runSubmit(options: { step: FlowStep; endpoint: string; body: Record<string, unknown>; successMessage: string; resetForm: () => void; nextStep?: FlowStep; }) {
    const { step, endpoint, body, successMessage, resetForm, nextStep } = options;
    setStepFlash(step, null);
    startTransition(async () => {
      setPendingKey(step);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const payload = await response.json() as ApiErrorResponse;
        if (!response.ok) {
          let msg = payload.error?.message ?? "Gagal.";
          if (payload.error?.details?.fieldErrors) {
            msg = `Validasi: ${Object.entries(payload.error.details.fieldErrors).map(([f, m]) => `${f}: ${m.join(", ")}`).join(" | ")}`;
          }
          setStepFlash(step, { type: "error", message: msg });
          return;
        }
        resetForm();
        setStepFlash(step, { type: "success", message: successMessage });
        if (nextStep) setActiveStep(nextStep);
        router.refresh();
      } catch (err: any) {
        setStepFlash(step, { type: "error", message: err.message });
      } finally { setPendingKey(null); }
    });
  }

  function runReadinessCheck(endpoint: string) {
    setOpsFlash(null);
    startTransition(async () => {
      setPendingKey(endpoint);
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        setOpsFlash({ type: data.success ? "success" : "error", message: data.success ? `${endpoint} OK` : data.error?.message });
      } catch (err: any) { setOpsFlash({ type: "error", message: err.message }); }
      finally { setPendingKey(null); }
    });
  }

  const roleNeedsPassword = selectedMemberRole === "SUPER_ADMIN" || selectedMemberRole === "ADMIN";

  return (
    <section id="master-data-form" className="britsafe-card" style={{ padding: "32px", borderTop: "4px solid var(--ajs-teal)" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span className="britsafe-card__category">Program Creation Wizard</span>
          <h2 className="britsafe-card__title" style={{ fontSize: "22px", margin: "8px 0 0" }}>Pusat Pembuatan Pelatihan</h2>
        </div>
        <button onClick={() => setIsFormVisible(!isFormVisible)} className="cta-primary" style={{ padding: '10px 24px', fontSize: '13px', background: isFormVisible ? 'var(--ajs-navy)' : 'var(--ajs-orange)' }}>
          {isFormVisible ? "Tutup Formulir" : "+ Buat Program Baru"}
        </button>
      </div>

      {!isFormVisible && (
        <p style={{ fontSize: "13px", color: "var(--ajs-muted)", margin: 0 }}>Klik tombol di atas untuk membuka formulir.</p>
      )}

      {isFormVisible && (
        <>
          <p style={{ fontSize: "13px", color: "var(--ajs-muted)", marginBottom: '24px' }}>Pilih langkah di bawah.</p>
          {showWizard && (
            <div style={{ background: '#e8eaf6', padding: '24px', borderRadius: '8px', marginBottom: '24px', position: 'relative' }}>
              <button type="button" onClick={() => setShowWizard(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', border: '1px solid #c5cae9', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>X</button>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#283593', margin: '0 0 12px 0' }}>Panduan</h3>
              <ol style={{ fontSize: '14px', color: '#1a237e', lineHeight: 1.6 }}>
                <li>Step 1: Program.</li>
                <li>Step 2: Batch.</li>
                <li>Step 3: Session.</li>
              </ol>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "16px" }}>
            {FLOW_STEPS.map(step => (
              <StepButton key={step.key} label={step.label} hint={step.hint} active={activeStep === step.key} onClick={() => setActiveStep(step.key)} />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", alignItems: "start" }}>
            <div className="section-card" style={{ padding: "18px" }}>
              {activeStep === "program" && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const title = getRequiredString(fd.get("title"));
                  const schema = unitSchemas.find(s => s.title === title);
                  runSubmit({
                    step: "program", endpoint: "/api/programs",
                    body: { title, category: fd.get("category"), industryType: fd.get("industryType"), description: fd.get("description"), isActive: fd.get("isActive") === "on", unitSchemaId: schema?.id },
                    successMessage: "Berhasil.", resetForm: () => (e.target as HTMLFormElement).reset(), nextStep: "batch"
                  });
                }}>
                  <h3>Create Program</h3>
                  <label className="field-group"><span>Judul</span>
                    <input className="text-input" name="title" list="template-list" required />
                    <datalist id="template-list">{unitSchemas.map(s => <option key={s.id} value={s.title} />)}</datalist>
                  </label>
                  <label className="field-group"><span>Kategori</span>
                    <select className="text-input" name="category" value={selectedProgramCategory} onChange={e => setSelectedProgramCategory(e.target.value)}>
                      {PROGRAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="field-group"><span>Industri</span><input className="text-input" name="industryType" defaultValue="Umum" required /></label>
                  <label className="field-group"><span>Deskripsi</span><textarea className="text-input" name="description" /></label>
                  <label><input type="checkbox" name="isActive" defaultChecked /> Aktif</label>
                  <button className="cta-primary" type="submit" disabled={isPending} style={{ width: '100%' }}>Create</button>
                  <FlashBanner flash={flashes.program} />
                </form>
              )}

              {activeStep === "batch" && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  runSubmit({
                    step: "batch", endpoint: "/api/batches",
                    body: { title: getOptionalString(fd.get("title")), programId: fd.get("programId"), classroomId: fd.get("classroomId"), startDate: toWita(fd.get("startDate")), endDate: toWita(fd.get("endDate")), quota: fd.get("quota"), price: fd.get("price") },
                    successMessage: "Berhasil.", resetForm: () => (e.target as HTMLFormElement).reset(), nextStep: "session"
                  });
                }}>
                  <h3>Create Batch</h3>
                  <label className="field-group"><span>Nama Batch (Opsional)</span><input className="text-input" name="title" placeholder="Cth: Reguler 1 Agustus" /></label>
                  <label className="field-group"><span>Program</span>
                    <select className="text-input" name="programId" required>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </label>
                  <label className="field-group"><span>Mulai</span><input className="text-input" type="datetime-local" name="startDate" required /></label>
                  <label className="field-group"><span>Selesai</span><input className="text-input" type="datetime-local" name="endDate" required /></label>
                  <label className="field-group"><span>Ruang</span>
                    <select className="text-input" name="classroomId"><option value="">-- Pilih --</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.roomName}</option>)}</select>
                  </label>
                  <label className="field-group"><span>Kuota</span><input className="text-input" type="number" name="quota" required /></label>
                  <label className="field-group"><span>Harga</span><input className="text-input" type="number" name="price" /></label>
                  <button className="cta-primary" type="submit" disabled={isPending} style={{ width: '100%' }}>Create</button>
                  <FlashBanner flash={flashes.batch} />
                </form>
              )}

              {activeStep === "session" && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  runSubmit({
                    step: "session", endpoint: "/api/sessions",
                    body: { batchId: fd.get("batchId"), title: fd.get("title"), sessionDate: toWita(fd.get("sessionDate")), startTime: toWita(fd.get("startTime")), endTime: toWita(fd.get("endTime")), classroomId: getOptionalString(fd.get("classroomId")), instructorId: getOptionalString(fd.get("instructorId")) },
                    successMessage: "Berhasil.", resetForm: () => (e.target as HTMLFormElement).reset(), nextStep: "member"
                  });
                }}>
                  <h3>Create Session</h3>
                  <label className="field-group"><span>Batch</span>
                    <select className="text-input" name="batchId" required>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.programTitle} — {b.title ? `${b.title} (${new Date(b.startDate).toLocaleDateString('id-ID')} - ${new Date(b.endDate).toLocaleDateString('id-ID')})` : `Batch ${new Date(b.startDate).toLocaleDateString('id-ID')} - ${new Date(b.endDate).toLocaleDateString('id-ID')}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-group"><span>Judul Sesi</span><input className="text-input" name="title" required /></label>
                  <label className="field-group"><span>Tanggal</span><input className="text-input" type="datetime-local" name="sessionDate" required /></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <label className="field-group"><span>Mulai</span><input className="text-input" type="datetime-local" name="startTime" required /></label>
                    <label className="field-group"><span>Selesai</span><input className="text-input" type="datetime-local" name="endTime" required /></label>
                  </div>
                  <label className="field-group"><span>Ruang Kelas (Opsional)</span>
                    <select className="text-input" name="classroomId">
                      <option value="">-- Menunggu Ruangan --</option>
                      {classrooms.map(c => <option key={c.id} value={c.id}>{c.roomName}</option>)}
                    </select>
                  </label>
                  <label className="field-group"><span>Instruktur (Opsional)</span>
                    <select className="text-input" name="instructorId">
                      <option value="">-- TBA --</option>
                      {internalMembers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                    </select>
                  </label>
                  <button className="cta-primary" type="submit" disabled={isPending} style={{ width: '100%' }}>Create</button>
                  <FlashBanner flash={flashes.session} />
                </form>
              )}
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="section-card" style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Snapshot</h4>
                <div style={{ fontSize: '13px' }}>
                  <div>Programs: {programs.length}</div>
                  <div>Batches: {batches.length}</div>
                </div>
              </div>
              <div className="section-card" style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Health</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => runReadinessCheck("/api/health")}>Check Health</button>
                </div>
                <FlashBanner flash={opsFlash} />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
