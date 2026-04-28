"use client";

import { useState, useTransition } from "react";
import { Role, InstructorLevel } from "@prisma/client";

type InternalMember = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  instructorLevel: InstructorLevel | null;
  licenseNumber: string | null;
  profilePictureUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

type FlashState = {
  type: "success" | "error";
  message: string;
} | null;

type ApiErrorResponse = {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
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

export function InstructorAssessorPanel({
  members
}: {
  members: InternalMember[];
}) {
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"list" | "add-member">("list");
  const [flash, setFlash] = useState<FlashState>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("INSTRUCTOR");
  const [editingMember, setEditingMember] = useState<InternalMember | null>(null);
  
  async function handleDelete(id: string) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus member ini?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/internal-members/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus member.");
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  }

  // internalRoles as defined in schema
  const internalRoles: Role[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "INSTRUCTOR",
    "ASSESSOR",
    "CLIENT_HR",
    "AUDITOR"
  ];

  const adminRolesForPassword: Role[] = ["SUPER_ADMIN", "ADMIN"];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setFlash(null);

    const role = formData.get("role") as Role;

    startTransition(async () => {
      try {
        const response = await fetch(editingMember ? `/api/internal-members/${editingMember.id}` : "/api/internal-members", {
          method: editingMember ? "PATCH" : "POST",
          body: formData
        });
        const data = (await response.json()) as ApiErrorResponse;

        if (!response.ok) {
          let message = data.error?.message ?? "Permintaan API gagal diproses.";
          if (data.error?.code === "VALIDATION_ERROR" && data.error?.details) {
            const details = data.error.details as Record<string, string>;
            const errorList = Object.entries(details)
              .map(([field, err]) => `${field}: ${err}`)
              .join(" | ");
            if (errorList) {
              message = `Validasi gagal (${errorList})`;
            }
          }
          setFlash({ type: "error", message });
          return;
        }

        form.reset();
        setSelectedRole("INSTRUCTOR");
        setFlash({
          type: "success",
          message: editingMember ? "Data member berhasil diperbarui." : "Data member berhasil ditambahkan."
        });

        window.location.reload();
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Gagal terhubung ke server.";
        setFlash({ type: "error", message });
      }
    });
  }

  return (
    <section
      className="britsafe-card"
      style={{ padding: "32px", borderTop: "4px solid var(--accent)" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <span className="britsafe-card__category">
          Database Instruktur & Asesor
        </span>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            margin: "8px 0"
          }}
        >
          <h2
            className="britsafe-card__title"
            style={{ fontSize: "22px", margin: 0 }}
          >
            Kelola Tenaga Pengajar dan Asesor
          </h2>
          {viewMode === "list" && (
            <button
              className="cta-primary"
              onClick={() => { setEditingMember(null); setSelectedRole("INSTRUCTOR"); setViewMode("add-member"); }}
            >
              + Tambah Data Baru
            </button>
          )}
        </div>
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          {viewMode === "list"
            ? "Daftar seluruh instruktur, asesor, dan member internal."
            : "Lengkapi form di bawah untuk menambah entitas baru."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            viewMode === "list" ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          alignItems: "start"
        }}
      >
        {viewMode === "add-member" && (
          <form
            className="section-card"
            style={{ padding: "18px" }}
            onSubmit={handleSubmit}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--ink)" }}>
                {editingMember ? "Edit Member Internal" : "Tambah Member Internal"}
              </h3>
              <button
                type="button"
                onClick={() => { setViewMode("list"); setEditingMember(null); }}
                style={{
                  fontSize: "12px",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Tutup
              </button>
            </div>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Nama Lengkap</span>
              <input
                className="text-input"
                name="fullName"
                defaultValue={editingMember?.fullName}
                placeholder="Dr. John Doe"
                required
              />
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Email</span>
              <input
                className="text-input"
                type="email"
                name="email"
                defaultValue={editingMember?.email}
                placeholder="johndoe@example.com"
                required
              />
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">No. Telepon (opsional)</span>
              <input
                className="text-input"
                name="phone"
                defaultValue={editingMember?.phone ?? ""}
                placeholder="081234567890"
              />
            </label>
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Role Akses</span>
              <select
                className="text-input"
                name="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                required
              >
                {internalRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            {selectedRole === "INSTRUCTOR" && (
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Level Instruktur</span>
                <select className="text-input" name="instructorLevel" required defaultValue={editingMember?.instructorLevel ?? "JUNIOR"}>
                  <option value="JUNIOR">JUNIOR</option>
                  <option value="MADYA">MADYA</option>
                  <option value="SENIOR">SENIOR</option>
                  <option value="MASTER">MASTER</option>
                </select>
              </label>
            )}

            
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Foto Profil (opsional)</span>
              <input
                type="file"
                className="text-input"
                name="profilePicture"
                accept="image/jpeg, image/png, image/webp"
              />
              <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                Maksimal 2MB. Format: JPG, PNG, WEBP.
              </span>
              {editingMember?.profilePictureUrl && (
                <label style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px", fontSize: "12px", color: "#dc2626" }}>
                  <input type="checkbox" name="removePhoto" value="true" />
                  Hapus foto saat ini
                </label>
              )}
            </label>

            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Nomor Registrasi / Lisensi Resmi (opsional)</span>
              <input
                className="text-input"
                name="licenseNumber"
                defaultValue={editingMember?.licenseNumber ?? ""}
                placeholder="Contoh: MET.000.000213.2023 atau 5/123/AS.02.04/V/2026"
              />
            </label>

            {adminRolesForPassword.includes(selectedRole) && (
              <label className="field-group" style={{ marginBottom: "12px" }}>
                <span className="field-label">Password Sementara</span>
                <input
                  className="text-input"
                  type="password"
                  name="password"
                  minLength={8}
                  placeholder={editingMember ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 8 karakter"}
                  required={!editingMember}
                />
              </label>
            )}

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
              <input type="checkbox" name="isActive" defaultChecked={editingMember ? editingMember.isActive : true} />
              Status Aktif
            </label>
            <button
              className="cta-primary"
              type="submit"
              disabled={isPending}
              style={{ width: "100%" }}
            >
              {isPending ? "Menyimpan..." : editingMember ? "Update Member" : "Create Member"}
            </button>
            <FlashBanner flash={flash} />
          </form>
        )}

        {viewMode === "list" && (
          <div className="section-card" style={{ padding: "18px" }}>
            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
              }}
            >
              {members.length === 0 ? (
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  Belum ada data member internal terdaftar.
                </div>
              ) : (
                members.map((member) => (
                  <article
                    key={member.id}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: "var(--radius-sm)",
                      padding: "16px",
                      background: "white",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px"
                      }}
                    >
                      
                      {member.profilePictureUrl ? (
                        <img 
                          src={member.profilePictureUrl} 
                          alt={member.fullName} 
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", backgroundColor: "var(--line)" }} 
                        />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--ajs-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" }}>
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong
                          style={{
                            fontSize: "15px",
                            color: "var(--ink)",
                            display: "block",
                            lineHeight: 1.2
                          }}
                        >
                          {member.fullName}
                        </strong>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                          {member.email}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: member.isActive
                            ? "rgba(0,166,81,0.1)"
                            : "rgba(227,30,36,0.1)",
                          color: member.isActive ? "var(--ajs-green)" : "#dc2626",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {member.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" onClick={() => { setEditingMember(member); setSelectedRole(member.role); setViewMode("add-member"); }} style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(member.id)} style={{ fontSize: "11px", fontWeight: "bold", color: "#dc2626", background: "transparent", border: "none", cursor: "pointer" }}>Hapus</button>
                      </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginTop: "4px"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "20px",
                          background: "var(--ajs-navy)",
                          color: "white"
                        }}
                      >
                        {member.role}
                      </span>
                      {member.role === "INSTRUCTOR" && member.instructorLevel && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "20px",
                            background: "var(--accent)",
                            color: "white"
                          }}
                        >
                          Level: {member.instructorLevel}
                        </span>
                      )}
                      {member.licenseNumber && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "20px",
                            background: "var(--ajs-blue)",
                            color: "white"
                          }}
                        >
                          No: {member.licenseNumber}
                        </span>
                      )}
                    </div>
                    {member.phone && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--ink-soft)",
                          marginTop: "auto",
                          paddingTop: "8px",
                          borderTop: "1px solid var(--line)"
                        }}
                      >
                        Tel: {member.phone}
                      </div>
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
