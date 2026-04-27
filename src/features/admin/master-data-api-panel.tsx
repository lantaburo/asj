"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

type ProgramOption = {
  id: string;
  title: string;
  isActive: boolean;
};

type BatchOption = {
  id: string;
  status: string;
  programTitle: string;
};

type ClassroomOption = {
  id: string;
  roomName: string;
  isAvailable: boolean;
};

type InternalMemberOption = {
  id: string;
  fullName: string;
  role: string;
  instructorLevel: string | null;
};

type FlowStep = "program" | "batch" | "classroom" | "session" | "member";

type FlashState = {
  type: "success" | "error";
  message: string;
} | null;

type ApiErrorResponse = {
  error?: {
    message?: string;
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
    label: "Step 2 · Batch",
    hint: "Batch ditautkan ke program."
  },
  {
    key: "classroom",
    label: "Step 3 · Classroom",
    hint: "Atur kapasitas ruang pelatihan."
  },
  {
    key: "session",
    label: "Step 4 · Session",
    hint: "Susun jadwal per batch."
  },
  {
    key: "member",
    label: "Step 5 · Member",
    hint: "Daftarkan member internal + role."
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
  if (programs.length === 0) {
    return "program";
  }

  if (batches.length === 0) {
    return "batch";
  }

  if (classrooms.length === 0) {
    return "classroom";
  }

  if (internalMembers.length === 0) {
    return "member";
  }

  return "session";
}

function FlashBanner({ flash }: { flash: FlashState }) {
  if (!flash) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "12px",
        borderRadius: "var(--radius-sm)",
        padding: "10px 12px",
        fontSize: "13px",
        fontWeight: 600,
        border:
          flash.type === "success"
            ? "1px solid rgba(0,166,81,0.25)"
            : "1px solid rgba(227,30,36,0.25)",
        color: flash.type === "success" ? "var(--ajs-green)" : "var(--ajs-red)",
        background:
          flash.type === "success"
            ? "rgba(0,166,81,0.08)"
            : "rgba(227,30,36,0.08)"
      }}
    >
      {flash.message}
    </div>
  );
}

function StepButton({
  label,
  hint,
  active,
  onClick
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        border: active ? "1px solid rgba(244,121,32,0.4)" : "1px solid var(--ajs-border)",
        borderRadius: "var(--radius-sm)",
        padding: "12px",
        background: active ? "rgba(244,121,32,0.1)" : "white",
        display: "grid",
        gap: "4px"
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: active ? "var(--ajs-orange)" : "var(--ajs-navy)"
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>{hint}</span>
    </button>
  );
}

export function MasterDataApiPanel({
  programs,
  batches,
  classrooms,
  internalMembers
}: {
  programs: ProgramOption[];
  batches: BatchOption[];
  classrooms: ClassroomOption[];
  internalMembers: InternalMemberOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [selectedProgramCategory, setSelectedProgramCategory] = useState<string>(
    PROGRAM_CATEGORIES[0]
  );
  const [selectedMemberRole, setSelectedMemberRole] = useState<string>(
    INTERNAL_ROLES[2]
  );
  const [activeStep, setActiveStep] = useState<FlowStep>(() =>
    inferInitialStep(programs, batches, classrooms, internalMembers)
  );
  const [flashes, setFlashes] = useState<Record<FlowStep, FlashState>>(
    INITIAL_FLASHES
  );
  const [opsFlash, setOpsFlash] = useState<FlashState>(null);

  function setStepFlash(step: FlowStep, value: FlashState) {
    setFlashes((currentValue) => ({
      ...currentValue,
      [step]: value
    }));
  }

  function runSubmit(options: {
    step: FlowStep;
    endpoint: string;
    body: Record<string, unknown>;
    successMessage: string;
    resetForm: () => void;
    nextStep?: FlowStep;
  }) {
    const { step, endpoint, body, successMessage, resetForm, nextStep } = options;
    setStepFlash(step, null);

    startTransition(async () => {
      setPendingKey(step);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
        const payload = (await response.json()) as ApiErrorResponse;

        if (!response.ok) {
          setStepFlash(step, {
            type: "error",
            message: payload.error?.message ?? "Permintaan API gagal diproses."
          });
          return;
        }

        resetForm();
        setStepFlash(step, {
          type: "success",
          message: successMessage
        });
        if (nextStep) {
          setActiveStep(nextStep);
        }
        router.refresh();
      } catch (requestError) {
        setStepFlash(step, {
          type: "error",
          message:
            requestError instanceof Error
              ? requestError.message
              : "Gagal terhubung ke server."
        });
      } finally {
        setPendingKey(null);
      }
    });
  }

  function runReadinessCheck(endpoint: "/api/health" | "/api/readiness") {
    setOpsFlash(null);

    startTransition(async () => {
      setPendingKey(endpoint);

      try {
        const response = await fetch(endpoint);
        const payload = (await response.json()) as {
          success?: boolean;
          error?: {
            message?: string;
          };
        };

        if (!response.ok || !payload.success) {
          setOpsFlash({
            type: "error",
            message: payload.error?.message ?? `Pengecekan ${endpoint} gagal.`
          });
          return;
        }

        setOpsFlash({
          type: "success",
          message: `${endpoint} aktif dan merespons dengan baik.`
        });
      } catch (requestError) {
        setOpsFlash({
          type: "error",
          message:
            requestError instanceof Error
              ? requestError.message
              : "Gagal menghubungi endpoint operasional."
        });
      } finally {
        setPendingKey(null);
      }
    });
  }

  const hasPrograms = programs.length > 0;
  const hasBatches = batches.length > 0;
  const showCustomCategoryInput = selectedProgramCategory === "LAINNYA";
  const showInstructorLevelInput = selectedMemberRole === "INSTRUCTOR";
  const roleNeedsPassword =
    selectedMemberRole === "SUPER_ADMIN" || selectedMemberRole === "ADMIN";

  return (
    <section
      className="britsafe-card"
      style={{ padding: "32px", borderTop: "4px solid var(--ajs-teal)" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <span className="britsafe-card__category">API Operations</span>
        <h2
          className="britsafe-card__title"
          style={{ fontSize: "22px", margin: "8px 0 8px" }}
        >
          Flow operasional API yang lebih rapi dan bertahap.
        </h2>
        <p style={{ fontSize: "13px", color: "var(--ajs-muted)", margin: 0 }}>
          Pilih langkah di bawah, kerjakan satu form, lalu lanjut ke langkah
          berikutnya.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "16px"
        }}
      >
        {FLOW_STEPS.map((step) => (
          <StepButton
            key={step.key}
            label={step.label}
            hint={step.hint}
            active={activeStep === step.key}
            onClick={() => setActiveStep(step.key)}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
          alignItems: "start"
        }}
      >
        <div className="section-card" style={{ padding: "18px" }}>
          {activeStep === "program" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);

                runSubmit({
                  step: "program",
                  endpoint: "/api/programs",
                  body: {
                    title: getRequiredString(formData.get("title")),
                    category: getRequiredString(formData.get("category")),
                    customCategory: getOptionalString(formData.get("customCategory")),
                    industryType: getRequiredString(formData.get("industryType")),
                    description: getOptionalString(formData.get("description")),
                    isActive: formData.get("isActive") === "on"
                  },
                  successMessage: "Program baru berhasil dibuat.",
                  resetForm: () => form.reset(),
                  nextStep: "batch"
                });
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "18px",
                  color: "var(--ajs-navy)"
                }}
              >
                Create Program
              </h3>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Judul Program</span>
                <input
                  className="text-input"
                  name="title"
                  placeholder="Ahli K3 Umum"
                  required
                />
              </label>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Kategori</span>
                <select
                  className="text-input"
                  name="category"
                  value={selectedProgramCategory}
                  onChange={(event) =>
                    setSelectedProgramCategory(event.currentTarget.value)
                  }
                  required
                >
                  {PROGRAM_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              {showCustomCategoryInput ? (
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Custom Kategori</span>
                  <input
                    className="text-input"
                    name="customCategory"
                    placeholder="Contoh: ISO 45001"
                    required
                  />
                </label>
              ) : null}
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Industry Type</span>
                <input
                  className="text-input"
                  name="industryType"
                  defaultValue="Umum"
                  required
                />
              </label>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Deskripsi (opsional)</span>
                <textarea className="text-input" name="description" rows={3} />
              </label>
              <label
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: "13px",
                  color: "var(--ajs-text)",
                  marginBottom: "14px"
                }}
              >
                <input type="checkbox" name="isActive" defaultChecked />
                Program aktif
              </label>
              <button
                className="cta-primary"
                type="submit"
                disabled={isPending}
                style={{ width: "100%" }}
              >
                {isPending && pendingKey === "program"
                  ? "Membuat program..."
                  : "Create Program"}
              </button>
              <FlashBanner flash={flashes.program} />
            </form>
          ) : null}

          {activeStep === "batch" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);

                runSubmit({
                  step: "batch",
                  endpoint: "/api/batches",
                  body: {
                    programId: getRequiredString(formData.get("programId")),
                    instructorId: getOptionalString(formData.get("instructorId")),
                    startDate: getRequiredString(formData.get("startDate")),
                    endDate: getRequiredString(formData.get("endDate")),
                    quota: getRequiredString(formData.get("quota")),
                    price: getOptionalString(formData.get("price"))
                  },
                  successMessage: "Batch baru berhasil dibuat.",
                  resetForm: () => form.reset(),
                  nextStep: "classroom"
                });
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "18px",
                  color: "var(--ajs-navy)"
                }}
              >
                Create Batch
              </h3>
              {!hasPrograms ? (
                <div
                  className="error-banner"
                  style={{ marginBottom: "12px" }}
                >
                  Belum ada program. Selesaikan Step 1 terlebih dahulu.
                </div>
              ) : null}
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Program</span>
                <select
                  className="text-input"
                  name="programId"
                  required
                  defaultValue={programs[0]?.id ?? ""}
                  disabled={!hasPrograms}
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title} {program.isActive ? "(Aktif)" : "(Nonaktif)"}
                    </option>
                  ))}
                </select>
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px"
                }}
              >
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Mulai</span>
                  <input
                    className="text-input"
                    type="datetime-local"
                    name="startDate"
                    required
                  />
                </label>
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Selesai</span>
                  <input
                    className="text-input"
                    type="datetime-local"
                    name="endDate"
                    required
                  />
                </label>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px"
                }}
              >
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Kuota</span>
                  <input
                    className="text-input"
                    type="number"
                    min={1}
                    name="quota"
                    placeholder="25"
                    required
                  />
                </label>
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Harga (opsional)</span>
                  <input
                    className="text-input"
                    type="number"
                    min={0}
                    name="price"
                    placeholder="4500000"
                  />
                </label>
              </div>
              <label className="field-group" style={{ marginBottom: "14px" }}>
                <span className="field-label">Instructor ID (opsional)</span>
                <input
                  className="text-input"
                  name="instructorId"
                  placeholder="UUID user instructor"
                />
              </label>
              <button
                className="cta-primary"
                type="submit"
                disabled={isPending || !hasPrograms}
                style={{ width: "100%" }}
              >
                {isPending && pendingKey === "batch"
                  ? "Membuat batch..."
                  : "Create Batch"}
              </button>
              <FlashBanner flash={flashes.batch} />
            </form>
          ) : null}

          {activeStep === "classroom" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);

                runSubmit({
                  step: "classroom",
                  endpoint: "/api/classrooms",
                  body: {
                    roomName: getRequiredString(formData.get("roomName")),
                    capacity: getRequiredString(formData.get("capacity")),
                    isAvailable: formData.get("isAvailable") === "on"
                  },
                  successMessage: "Classroom baru berhasil dibuat.",
                  resetForm: () => form.reset(),
                  nextStep: "session"
                });
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "18px",
                  color: "var(--ajs-navy)"
                }}
              >
                Create Classroom
              </h3>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Nama Ruang</span>
                <input
                  className="text-input"
                  name="roomName"
                  placeholder="Ruang Kelas AJS 2"
                  required
                />
              </label>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Kapasitas</span>
                <input
                  className="text-input"
                  type="number"
                  min={1}
                  name="capacity"
                  placeholder="30"
                  required
                />
              </label>
              <label
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: "13px",
                  color: "var(--ajs-text)",
                  marginBottom: "14px"
                }}
              >
                <input type="checkbox" name="isAvailable" defaultChecked />
                Ruang tersedia
              </label>
              <button
                className="cta-primary"
                type="submit"
                disabled={isPending}
                style={{ width: "100%" }}
              >
                {isPending && pendingKey === "classroom"
                  ? "Membuat classroom..."
                  : "Create Classroom"}
              </button>
              <FlashBanner flash={flashes.classroom} />
            </form>
          ) : null}

          {activeStep === "session" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);

                runSubmit({
                  step: "session",
                  endpoint: "/api/sessions",
                  body: {
                    batchId: getRequiredString(formData.get("batchId")),
                    classroomId: getOptionalString(formData.get("classroomId")),
                    instructorId: getOptionalString(formData.get("instructorId")),
                    title: getRequiredString(formData.get("title")),
                    sessionDate: getRequiredString(formData.get("sessionDate")),
                    startTime: getRequiredString(formData.get("startTime")),
                    endTime: getRequiredString(formData.get("endTime")),
                    locationType: getOptionalString(formData.get("locationType"))
                  },
                  successMessage: "Session baru berhasil dibuat.",
                  resetForm: () => form.reset(),
                  nextStep: "member"
                });
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "18px",
                  color: "var(--ajs-navy)"
                }}
              >
                Create Session
              </h3>
              {!hasBatches ? (
                <div
                  className="error-banner"
                  style={{ marginBottom: "12px" }}
                >
                  Belum ada batch. Selesaikan Step 2 terlebih dahulu.
                </div>
              ) : null}
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Batch</span>
                <select
                  className="text-input"
                  name="batchId"
                  required
                  defaultValue={batches[0]?.id ?? ""}
                  disabled={!hasBatches}
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.programTitle} - {batch.status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Judul Session</span>
                <input
                  className="text-input"
                  name="title"
                  placeholder="Pembukaan dan Pengantar K3"
                  required
                />
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px"
                }}
              >
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Tanggal Session</span>
                  <input
                    className="text-input"
                    type="datetime-local"
                    name="sessionDate"
                    required
                  />
                </label>
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Lokasi</span>
                  <input
                    className="text-input"
                    name="locationType"
                    defaultValue="Classroom"
                  />
                </label>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px"
                }}
              >
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Mulai</span>
                  <input
                    className="text-input"
                    type="datetime-local"
                    name="startTime"
                    required
                  />
                </label>
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Selesai</span>
                  <input
                    className="text-input"
                    type="datetime-local"
                    name="endTime"
                    required
                  />
                </label>
              </div>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Classroom (opsional)</span>
                <select className="text-input" name="classroomId" defaultValue="">
                  <option value="">Tanpa Classroom</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.roomName}{" "}
                      {classroom.isAvailable ? "(Tersedia)" : "(Penuh)"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-group" style={{ marginBottom: "14px" }}>
                <span className="field-label">Instructor ID (opsional)</span>
                <input
                  className="text-input"
                  name="instructorId"
                  placeholder="UUID user instructor"
                />
              </label>
              <button
                className="cta-primary"
                type="submit"
                disabled={isPending || !hasBatches}
                style={{ width: "100%" }}
              >
                {isPending && pendingKey === "session"
                  ? "Membuat session..."
                  : "Create Session"}
              </button>
              <FlashBanner flash={flashes.session} />
            </form>
          ) : null}

          {activeStep === "member" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);

                runSubmit({
                  step: "member",
                  endpoint: "/api/internal-members",
                  body: {
                    fullName: getRequiredString(formData.get("fullName")),
                    email: getRequiredString(formData.get("email")),
                    phone: getOptionalString(formData.get("phone")),
                    role: getRequiredString(formData.get("role")),
                    instructorLevel: getOptionalString(
                      formData.get("instructorLevel")
                    ),
                    password: getOptionalString(formData.get("password")),
                    isActive: formData.get("isActive") === "on"
                  },
                  successMessage: "Member internal berhasil ditambahkan.",
                  resetForm: () => form.reset()
                });
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "18px",
                  color: "var(--ajs-navy)"
                }}
              >
                Add Internal Member
              </h3>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Nama Lengkap</span>
                <input
                  className="text-input"
                  name="fullName"
                  placeholder="Nama member internal"
                  required
                />
              </label>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Email</span>
                <input
                  className="text-input"
                  type="email"
                  name="email"
                  placeholder="nama@ajs.local"
                  required
                />
              </label>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Telepon (opsional)</span>
                <input
                  className="text-input"
                  name="phone"
                  placeholder="0812xxxxxxx"
                />
              </label>
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Role Internal</span>
                <select
                  className="text-input"
                  name="role"
                  value={selectedMemberRole}
                  onChange={(event) =>
                    setSelectedMemberRole(event.currentTarget.value)
                  }
                  required
                >
                  {INTERNAL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              {showInstructorLevelInput ? (
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Level Instruktur</span>
                  <select className="text-input" name="instructorLevel" required>
                    {INSTRUCTOR_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <input type="hidden" name="instructorLevel" value="" />
              )}
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">
                  Password {roleNeedsPassword ? "(wajib)" : "(opsional)"}
                </span>
                <input
                  className="text-input"
                  type="password"
                  name="password"
                  placeholder="Minimal 8 karakter"
                  required={roleNeedsPassword}
                />
              </label>
              <label
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: "13px",
                  color: "var(--ajs-text)",
                  marginBottom: "14px"
                }}
              >
                <input type="checkbox" name="isActive" defaultChecked />
                Member aktif
              </label>
              <button
                className="cta-primary"
                type="submit"
                disabled={isPending}
                style={{ width: "100%" }}
              >
                {isPending && pendingKey === "member"
                  ? "Menyimpan member..."
                  : "Add Internal Member"}
              </button>
              <FlashBanner flash={flashes.member} />
            </form>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <div className="section-card" style={{ padding: "16px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--ajs-navy)",
                marginBottom: "10px"
              }}
            >
              Snapshot Data
            </div>
            <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
              <div>
                Program: <strong>{programs.length}</strong>
              </div>
              <div>
                Batch: <strong>{batches.length}</strong>
              </div>
              <div>
                Classroom: <strong>{classrooms.length}</strong>
              </div>
              <div>
                Member Internal: <strong>{internalMembers.length}</strong>
              </div>
              <div>
                Instruktur:
                <strong>
                  {" "}
                  {
                    internalMembers.filter((member) => member.role === "INSTRUCTOR")
                      .length
                  }
                </strong>
              </div>
            </div>
          </div>

          <div className="section-card" style={{ padding: "16px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--ajs-navy)",
                marginBottom: "10px"
              }}
            >
              Quick Check Operasional
            </div>
            <div style={{ display: "grid", gap: "8px" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => runReadinessCheck("/api/health")}
                disabled={isPending}
              >
                {isPending && pendingKey === "/api/health"
                  ? "Checking..."
                  : "Check /api/health"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => runReadinessCheck("/api/readiness")}
                disabled={isPending}
              >
                {isPending && pendingKey === "/api/readiness"
                  ? "Checking..."
                  : "Check /api/readiness"}
              </button>
            </div>
            <FlashBanner flash={opsFlash} />
          </div>
        </div>
      </div>
    </section>
  );
}
