"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ProgramOption = {
  id: string;
  title: string;
  isActive: boolean;
};

type UnitOption = {
  id: string;
  unitCode: string;
  title: string;
  orderIndex: number;
  isMandatory: boolean;
};

type UnitSchemaOption = {
  id: string;
  code: string;
  title: string;
  level: string | null;
  isActive: boolean;
  program: {
    id: string;
    title: string;
  } | null;
  unitCount: number;
  units: UnitOption[];
};

type FlashState = {
  type: "success" | "error";
  message: string;
} | null;

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
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

export function UnitSchemaAdminPanel({
  programs,
  schemas
}: {
  programs: ProgramOption[];
  schemas: UnitSchemaOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(
    schemas[0]?.id ?? ""
  );
  const [schemaFlash, setSchemaFlash] = useState<FlashState>(null);
  const [unitFlash, setUnitFlash] = useState<FlashState>(null);

  useEffect(() => {
    if (!schemas.length) {
      if (selectedSchemaId !== "") {
        setSelectedSchemaId("");
      }
      return;
    }

    const selectedStillExists = schemas.some(
      (schema) => schema.id === selectedSchemaId
    );

    if (!selectedStillExists) {
      setSelectedSchemaId(schemas[0].id);
    }
  }, [schemas, selectedSchemaId]);

  function runSubmit(options: {
    key: "schema" | "unit";
    endpoint: string;
    body: Record<string, unknown>;
    successMessage: string;
    resetForm: () => void;
  }) {
    const { key, endpoint, body, successMessage, resetForm } = options;
    if (key === "schema") {
      setSchemaFlash(null);
    } else {
      setUnitFlash(null);
    }

    startTransition(async () => {
      setPendingKey(key);

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
          const message =
            payload.error?.message ?? "Permintaan API gagal diproses.";
          if (key === "schema") {
            setSchemaFlash({
              type: "error",
              message
            });
          } else {
            setUnitFlash({
              type: "error",
              message
            });
          }
          return;
        }

        resetForm();

        if (key === "schema") {
          setSchemaFlash({
            type: "success",
            message: successMessage
          });
        } else {
          setUnitFlash({
            type: "success",
            message: successMessage
          });
        }

        router.refresh();
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Gagal terhubung ke server.";

        if (key === "schema") {
          setSchemaFlash({
            type: "error",
            message
          });
        } else {
          setUnitFlash({
            type: "error",
            message
          });
        }
      } finally {
        setPendingKey(null);
      }
    });
  }

  return (
    <section
      className="britsafe-card"
      style={{ padding: "32px", borderTop: "4px solid var(--ajs-teal)" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <span className="britsafe-card__category">Unit Skema Manager</span>
        <h2
          className="britsafe-card__title"
          style={{ fontSize: "22px", margin: "8px 0 8px" }}
        >
          Kelola bank skema dan unit kompetensi.
        </h2>
        <p style={{ fontSize: "13px", color: "var(--ajs-muted)", margin: 0 }}>
          Gunakan form kiri untuk menambah skema baru dan unit kompetensi.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          alignItems: "start"
        }}
      >
        <div style={{ display: "grid", gap: "12px" }}>
          <form
            className="section-card"
            style={{ padding: "18px" }}
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);

              runSubmit({
                key: "schema",
                endpoint: "/api/unit-schemas",
                body: {
                  code: getRequiredString(formData.get("code")),
                  title: getRequiredString(formData.get("title")),
                  programId: getOptionalString(formData.get("programId")),
                  level: getOptionalString(formData.get("level")),
                  description: getOptionalString(formData.get("description")),
                  isActive: formData.get("isActive") === "on"
                },
                successMessage: "Skema berhasil ditambahkan.",
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
              Create Unit Schema
            </h3>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Kode Skema</span>
              <input
                className="text-input"
                name="code"
                placeholder="AJS-AKU-2026"
                required
              />
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Judul Skema</span>
              <input
                className="text-input"
                name="title"
                placeholder="Skema Ahli K3 Umum"
                required
              />
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Program Terkait (opsional)</span>
              <select className="text-input" name="programId" defaultValue="">
                <option value="">Skema umum (lintas program)</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title} {program.isActive ? "(Aktif)" : "(Nonaktif)"}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Level (opsional)</span>
              <input className="text-input" name="level" placeholder="Level 6" />
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
              Skema aktif
            </label>
            <button
              className="cta-primary"
              type="submit"
              disabled={isPending}
              style={{ width: "100%" }}
            >
              {isPending && pendingKey === "schema"
                ? "Menyimpan skema..."
                : "Create Unit Schema"}
            </button>
            <FlashBanner flash={schemaFlash} />
          </form>

          <form
            className="section-card"
            style={{ padding: "18px" }}
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);
              const targetSchemaId = getRequiredString(formData.get("schemaId"));

              if (!targetSchemaId) {
                setUnitFlash({
                  type: "error",
                  message: "Pilih skema tujuan terlebih dahulu."
                });
                return;
              }

              runSubmit({
                key: "unit",
                endpoint: `/api/unit-schemas/${targetSchemaId}/units`,
                body: {
                  unitCode: getRequiredString(formData.get("unitCode")),
                  title: getRequiredString(formData.get("title")),
                  orderIndex: getRequiredString(formData.get("orderIndex")),
                  isMandatory: formData.get("isMandatory") === "on"
                },
                successMessage: "Unit kompetensi berhasil ditambahkan.",
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
              Add Schema Unit
            </h3>
            {!schemas.length ? (
              <div className="error-banner" style={{ marginBottom: "12px" }}>
                Belum ada skema. Buat skema dahulu sebelum menambah unit.
              </div>
            ) : null}
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Skema Tujuan</span>
              <select
                className="text-input"
                name="schemaId"
                value={selectedSchemaId}
                onChange={(event) => setSelectedSchemaId(event.currentTarget.value)}
                required
                disabled={!schemas.length}
              >
                {schemas.map((schema) => (
                  <option key={schema.id} value={schema.id}>
                    {schema.code} - {schema.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Kode Unit</span>
              <input
                className="text-input"
                name="unitCode"
                placeholder="K3-AKU-001"
                required
                disabled={!schemas.length}
              />
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Judul Unit</span>
              <input
                className="text-input"
                name="title"
                placeholder="Menerapkan Regulasi Dasar K3"
                required
                disabled={!schemas.length}
              />
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Urutan</span>
              <input
                className="text-input"
                type="number"
                min={1}
                name="orderIndex"
                defaultValue={1}
                required
                disabled={!schemas.length}
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
              <input
                type="checkbox"
                name="isMandatory"
                defaultChecked
                disabled={!schemas.length}
              />
              Unit wajib
            </label>
            <button
              className="cta-primary"
              type="submit"
              disabled={isPending || !schemas.length}
              style={{ width: "100%" }}
            >
              {isPending && pendingKey === "unit"
                ? "Menyimpan unit..."
                : "Add Unit"}
            </button>
            <FlashBanner flash={unitFlash} />
          </form>
        </div>

        <div className="section-card" style={{ padding: "18px" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--ajs-navy)",
              marginBottom: "10px"
            }}
          >
            Snapshot Unit Skema
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {schemas.length === 0 ? (
              <div style={{ fontSize: "13px", color: "var(--ajs-muted)" }}>
                Belum ada data unit skema.
              </div>
            ) : (
              schemas.map((schema) => (
                <article
                  key={schema.id}
                  style={{
                    border: "1px solid var(--ajs-border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    background: "white"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "8px"
                    }}
                  >
                    <strong style={{ fontSize: "13px", color: "var(--ajs-navy)" }}>
                      {schema.code}
                    </strong>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: schema.isActive
                          ? "rgba(0,166,81,0.1)"
                          : "rgba(227,30,36,0.1)",
                        color: schema.isActive ? "var(--ajs-green)" : "var(--ajs-red)"
                      }}
                    >
                      {schema.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    {schema.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                    Program: {schema.program?.title ?? "Umum"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ajs-muted)" }}>
                    Total Unit: {schema.unitCount}
                  </div>
                  {schema.units.length > 0 ? (
                    <ul
                      style={{
                        margin: "10px 0 0",
                        paddingLeft: "18px",
                        fontSize: "12px",
                        color: "var(--ajs-text)"
                      }}
                    >
                      {schema.units.slice(0, 3).map((unit) => (
                        <li key={unit.id}>
                          {unit.unitCode} - {unit.title}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
