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
        color: flash.type === "success" ? "var(--ajs-green)" : "#dc2626",
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
  const [editingSchemaId, setEditingSchemaId] = useState<string | null>(null);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"list" | "add-schema" | "add-unit">("list");
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

  async function runSubmit(options: {
    key: "schema" | "unit";
    endpoint: string;
    body: unknown;
    successMessage: string;
    resetForm: () => void;
  }) {
    const { key, endpoint, body, successMessage, resetForm } = options;
    if (key === "schema") {
      setSchemaFlash(null);
    } else {
      setUnitFlash(null);
    }

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
          let message =
            payload.error?.message ?? "Permintaan API gagal diproses.";
            
          if (payload.error?.code === "VALIDATION_ERROR" && payload.error?.details) {
            const details = payload.error.details as Record<string, string>;
            const errorList = Object.entries(details)
              .map(([field, err]) => `${field}: ${err}`)
              .join(" | ");
            if (errorList) {
              message = `Validasi gagal (${errorList})`;
            }
          }
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

        window.location.reload();
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
  }

  async function handleSchemaDelete(schemaId: string) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus skema ini beserta seluruh unitnya?")) return;

    setPendingKey(`delete-schema-${schemaId}`);
    try {
      const res = await fetch(`/api/unit-schemas/${schemaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus skema.");
      alert("Sukses menghapus skema dari database.");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setPendingKey(null);
    }
  }

  async function handleDeleteUnit(unitId: string) {
    if (!window.confirm("Yakin ingin menghapus unit kompetensi ini?")) return;

    setPendingKey(`delete-unit-${unitId}`);
    try {
      const res = await fetch(`/api/unit-schemas/units/${unitId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus unit.");
      alert("Sukses menghapus unit dari database.");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <section
      className="britsafe-card"
      style={{ padding: "32px", borderTop: "4px solid var(--accent)" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <span className="britsafe-card__category">Unit Skema Manager</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", margin: "8px 0" }}>
          <h2 className="britsafe-card__title" style={{ fontSize: "22px", margin: 0 }}>
            Kelola bank skema dan unit kompetensi.
          </h2>
          {viewMode === "list" && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="cta-primary" onClick={() => setViewMode("add-schema")}>+ Tambah Skema</button>
              <button className="cta-secondary" onClick={() => setViewMode("add-unit")}>+ Tambah Unit</button>
            </div>
          )}
        </div>
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          {viewMode === "list" ? "Daftar seluruh unit kompetensi dan skema yang tersedia." : "Lengkapi form di bawah untuk menambah data baru."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: viewMode === "list" ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          alignItems: "start"
        }}
      >
        <div style={{ display: viewMode === "list" ? "none" : "grid", gap: "12px" }}>
          {viewMode === "add-schema" && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--ink)" }}>Create Unit Schema</h3>
              <button type="button" onClick={() => setViewMode("list")} style={{ fontSize: "12px", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>Tutup</button>
            </div>
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
                color: "var(--ink-soft)",
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
          )}

          {viewMode === "add-unit" && (
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

              const isBulk = formData.get("isBulk") === "on";

              if (isBulk) {
                const bulkData = getRequiredString(formData.get("bulkData"));
                if (!bulkData) return;

                // Parse TSV (Tab Separated Values) from Excel copy-paste
                const rows = bulkData.split("\n").filter(r => r.trim());
                const units = rows.map(row => {
                  const cols = row.split("\t");
                  return {
                    unitCode: cols[0]?.trim() || "",
                    title: cols[1]?.trim() || "",
                    isMandatory: cols[2]?.trim().toUpperCase() !== "N"
                  };
                }).filter(u => u.unitCode && u.title);

                if (!units.length) {
                  setUnitFlash({ type: "error", message: "Data tidak valid. Pastikan format copy-paste dari Excel benar." });
                  return;
                }

                runSubmit({
                  key: "unit",
                  endpoint: `/api/unit-schemas/${targetSchemaId}/units/bulk`,
                  body: units,
                  successMessage: `${units.length} Unit kompetensi berhasil ditambahkan.`,
                  resetForm: () => form.reset()
                });
              } else {
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
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--ink)" }}>
                Add Schema Unit
              </h3>
              <button type="button" onClick={() => setViewMode("list")} style={{ fontSize: "12px", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>Tutup</button>
            </div>
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
            <div style={{ padding: '12px', background: 'rgba(22, 33, 47, 0.05)', borderRadius: '8px', marginBottom: '14px' }}>
              <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: "bold", color: "var(--ink)", marginBottom: '12px' }}>
                <input type="checkbox" name="isBulk" onChange={(e) => {
                  const bulkBlock = document.getElementById('bulk-input-block');
                  const singleBlock = document.getElementById('single-input-block');
                  if (e.target.checked) {
                    bulkBlock!.style.display = 'block';
                    singleBlock!.style.display = 'none';
                  } else {
                    bulkBlock!.style.display = 'none';
                    singleBlock!.style.display = 'block';
                  }
                }} />
                Mode Input Massal (Bulk / Excel)
              </label>

              <div id="bulk-input-block" style={{ display: 'none' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 0, marginBottom: '8px' }}>
                  <strong>Cara pakai:</strong> Copy data dari tabel Excel Anda, lalu Paste di kotak bawah ini.<br/>
                  Pastikan susunan kolom Excel Anda adalah: <code>Kode Unit</code> | <code>Judul Unit</code> | <code>Wajib? (Y/N)</code>
                </p>
                <textarea name="bulkData" className="text-input" rows={6} placeholder="K3-001    Dasar K3    Y&#10;K3-002    P3K Dasar   Y" style={{ fontFamily: 'monospace', fontSize: '12px' }}></textarea>
              </div>

              <div id="single-input-block">
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Kode Unit</span>
                  <input className="text-input" name="unitCode" placeholder="K3-AKU-001" disabled={!schemas.length} />
                </label>
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Judul Unit</span>
                  <input className="text-input" name="title" placeholder="Menerapkan Regulasi Dasar K3" disabled={!schemas.length} />
                </label>
                <label className="field-group" style={{ marginBottom: "12px" }}>
                  <span className="field-label">Urutan</span>
                  <input className="text-input" type="number" min={1} name="orderIndex" defaultValue={1} disabled={!schemas.length} />
                </label>
                <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--ink-soft)" }}>
                  <input type="checkbox" name="isMandatory" defaultChecked disabled={!schemas.length} />
                  Unit wajib
                </label>
              </div>
            </div>
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
          )}
        </div>

        {viewMode === "list" && (
        <div className="section-card" style={{ padding: "18px" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "10px"
            }}
          >
            Snapshot Unit Skema
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {schemas.length === 0 ? (
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                Belum ada data unit skema.
              </div>
            ) : (
              schemas.map((schema) => (
                <article
                  key={schema.id}
                  style={{
                    border: "1px solid var(--line)",
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
                    <strong style={{ fontSize: "13px", color: "var(--ink)" }}>
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
                        color: schema.isActive ? "var(--ajs-green)" : "#dc2626",
                        marginRight: "auto"
                      }}
                    >
                      {schema.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setEditingSchemaId(schema.id)}
                      disabled={isPending}
                      style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSchemaDelete(schema.id)}
                      disabled={isPending}
                      style={{ fontSize: "11px", fontWeight: "bold", color: "#dc2626", background: "transparent", border: "none", cursor: "pointer", marginLeft: "8px" }}
                    >
                      {isPending && pendingKey === `delete-schema-${schema.id}` ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                  
                  {editingSchemaId === schema.id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        setPendingKey(`edit-schema-${schema.id}`);
                        try {
                          const res = await fetch(`/api/unit-schemas/${schema.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                title: formData.get("title"),
                                code: formData.get("code"),
                                isActive: formData.get("isActive") === "on"
                              })
                            });
                            if (!res.ok) throw new Error("Gagal mengupdate skema");
                            setEditingSchemaId(null);
                                window.location.reload();
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Terjadi kesalahan");
                          } finally {
                            setPendingKey(null);
                          }
                      }}
                      style={{ display: "grid", gap: "8px", marginTop: "8px", padding: "12px", background: "rgba(22, 33, 47, 0.05)", borderRadius: "4px" }}
                    >
                      <input name="code" defaultValue={schema.code} className="text-input" style={{ fontSize: "12px", padding: "6px" }} required />
                      <input name="title" defaultValue={schema.title} className="text-input" style={{ fontSize: "12px", padding: "6px" }} required />
                      <label style={{ fontSize: "12px" }}><input type="checkbox" name="isActive" defaultChecked={schema.isActive} /> Aktif</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="submit" disabled={isPending} style={{ flex: 1, padding: "6px", fontSize: "12px", background: "var(--accent)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Simpan</button>
                        <button type="button" onClick={() => setEditingSchemaId(null)} style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", cursor: "pointer" }}>Batal</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        {schema.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        Program: {schema.program?.title ?? "Umum"}
                      </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      Total Unit: {schema.unitCount}
                    </div>
                    {schema.units.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedSchemas(prev => ({ ...prev, [schema.id]: !prev[schema.id] }))}
                        style={{ fontSize: "12px", background: "rgba(22, 33, 47, 0.05)", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        {expandedSchemas[schema.id] ? "Tutup ▲" : "Lihat Unit ▼"}
                      </button>
                    )}
                  </div>
                  {schema.units.length > 0 && expandedSchemas[schema.id] ? (
                    <ul
                      style={{
                        margin: "10px 0 0",
                        paddingLeft: "18px",
                        fontSize: "12px",
                        color: "var(--ink-soft)"
                      }}
                    >
                      {schema.units.map((unit) => (
                        <li key={unit.id} style={{ marginBottom: '6px' }}>
                          {editingUnitId === unit.id ? (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const formData = new FormData(form);
                                setPendingKey(`edit-unit-${unit.id}`);
                                try {
                                  const res = await fetch(`/api/unit-schemas/units/${unit.id}`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        unitCode: formData.get("unitCode"),
                                        title: formData.get("title")
                                      })
                                    });
                                  if (!res.ok) throw new Error("Gagal mengupdate unit");
                                  setEditingUnitId(null);
                                  window.location.reload();
                                } catch (err) {
                                  alert(err instanceof Error ? err.message : "Terjadi kesalahan");
                                } finally {
                                  setPendingKey(null);
                                }
                              }}
                              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
                            >
                              <input name="unitCode" defaultValue={unit.unitCode} className="text-input" style={{ fontSize: "11px", padding: "4px", width: "90px" }} required />
                              <input name="title" defaultValue={unit.title} className="text-input" style={{ fontSize: "11px", padding: "4px", flex: 1 }} required />
                              <button type="submit" disabled={isPending} style={{ flexShrink: 0, fontSize: "11px", padding: "4px 8px", background: "#0f766e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Simpan</button>
                              <button type="button" onClick={() => setEditingUnitId(null)} style={{ flexShrink: 0, fontSize: "11px", padding: "4px 8px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", cursor: "pointer" }}>Batal</button>
                            </form>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span>{unit.unitCode} - {unit.title}</span>
                              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => setEditingUnitId(unit.id)}
                                  disabled={isPending}
                                  style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer" }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUnit(unit.id)}
                                  disabled={isPending}
                                  style={{ fontSize: "11px", fontWeight: "bold", color: "#dc2626", background: "transparent", border: "none", cursor: "pointer" }}
                                >
                                  {isPending && pendingKey === `delete-unit-${unit.id}` ? "Menghapus..." : "Hapus"}
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
                </article>
              ))
            )}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
