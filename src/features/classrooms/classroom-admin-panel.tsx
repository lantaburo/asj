"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

type ClassroomOption = {
  id: string;
  roomName: string;
  capacity: number;
  facilities: string[] | null;
  isAvailable: boolean;
  sessionCount: number;
};

type FlashState = {
  type: "success" | "error";
  message: string;
} | null;

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

function getRequiredString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function FlashBanner({ flash }: { flash: FlashState }) {
  if (!flash) return null;
  return (
    <div
      style={{
        marginTop: "12px",
        borderRadius: "var(--radius-sm)",
        padding: "10px 12px",
        fontSize: "13px",
        fontWeight: 600,
        border: flash.type === "success" ? "1px solid rgba(0,166,81,0.25)" : "1px solid rgba(227,30,36,0.25)",
        color: flash.type === "success" ? "var(--ajs-green)" : "#dc2626",
        background: flash.type === "success" ? "rgba(0,166,81,0.08)" : "rgba(227,30,36,0.08)"
      }}
    >
      {flash.message}
    </div>
  );
}

export function ClassroomAdminPanel({ classrooms }: { classrooms: ClassroomOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"list" | "add">("list");
  const [flash, setFlash] = useState<FlashState>(null);
  const [expandedClassroomId, setExpandedClassroomId] = useState<string | null>(null);
  const [editingClassroomId, setEditingClassroomId] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  async function handleDelete(classroomId: string) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;

    setPendingKey(`delete-${classroomId}`);
    try {
      const response = await fetch(`/api/classrooms/${classroomId}`, {
        method: "DELETE"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Gagal menghapus kelas.");
      
      alert("Kelas berhasil dihapus.");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setPendingKey(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFlash(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const response = await fetch("/api/classrooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: getRequiredString(formData.get("roomName")),
            capacity: getRequiredString(formData.get("capacity")),
            isAvailable: formData.get("isAvailable") === "on",
            facilities: formData.getAll("facilities")
          })
        });

        const payload = await response.json();
        if (!response.ok) {
          setFlash({ type: "error", message: payload.error?.message || "Gagal membuat classroom." });
          return;
        }

        setFlash({ type: "success", message: "Classroom berhasil ditambahkan." });
        form.reset();
        router.refresh();
      } catch (err) {
        setFlash({ type: "error", message: err instanceof Error ? err.message : "Terjadi kesalahan." });
      }
    });
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>, classroomId: string) {
    event.preventDefault();
    setPendingKey(`edit-${classroomId}`);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/classrooms/${classroomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: getRequiredString(formData.get("roomName")),
          capacity: Number(getRequiredString(formData.get("capacity"))),
          isAvailable: formData.get("isAvailable") === "on",
          facilities: formData.getAll("facilities")
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Gagal mengupdate kelas.");

      setEditingClassroomId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <section className="britsafe-card" style={{ padding: "32px", borderTop: "4px solid var(--ajs-teal)" }}>
      <div style={{ marginBottom: "20px" }}>
        <span className="britsafe-card__category">Classroom Manager</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", margin: "8px 0" }}>
          <h2 className="britsafe-card__title" style={{ fontSize: "22px", margin: 0 }}>
            Kelola fasilitas kelas dan standar K3.
          </h2>
          {viewMode === "list" && (
            <button className="cta-primary" onClick={() => setViewMode("add")}>+ Tambah Kelas Baru</button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: "16px", alignItems: "start" }}>
        {viewMode === "add" && (
          <form className="section-card" style={{ padding: "18px" }} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--ajs-navy)" }}>Create Classroom</h3>
              <button type="button" onClick={() => setViewMode("list")} style={{ fontSize: "12px", background: "none", border: "none", color: "var(--ajs-muted)", cursor: "pointer", textDecoration: "underline" }}>Batal</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <label className="field-group">
                <span className="field-label">Nama Ruang</span>
                <input className="text-input" name="roomName" placeholder="Ruang Kelas AJS 2" required />
              </label>
              <label className="field-group">
                <span className="field-label">Kapasitas</span>
                <input className="text-input" type="number" min={1} name="capacity" placeholder="30" required />
              </label>
            </div>

            <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--ajs-text)", marginBottom: "14px" }}>
              <input type="checkbox" name="isAvailable" defaultChecked />
              Ruang tersedia
            </label>

            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "14px", color: "var(--ajs-navy)", margin: "0 0 10px 0" }}>Checklist Standar K3 Internasional (ISO 29993 / OSHA)</h4>
              <div style={{ display: "grid", gap: "12px", maxHeight: "300px", overflowY: "auto", padding: "12px", border: "1px solid var(--ajs-border)", borderRadius: "var(--radius-sm)", background: "#f8fafc" }}>
                {K3_FACILITIES_GROUPS.map((group) => (
                  <div key={group.category}>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--ajs-navy)", marginBottom: "6px" }}>{group.category}</div>
                    <div style={{ display: "grid", gap: "6px", paddingLeft: "8px" }}>
                      {group.items.map((item) => (
                        <label key={item} style={{ display: "flex", gap: "6px", alignItems: "start", fontSize: "12px", color: "var(--ajs-text)", cursor: "pointer" }}>
                          <input type="checkbox" name="facilities" value={item} style={{ marginTop: "2px" }} />
                          <span style={{ lineHeight: "1.4" }}>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="cta-primary" type="submit" disabled={isPending} style={{ width: "100%" }}>
              {isPending ? "Menyimpan classroom..." : "Create Classroom"}
            </button>
            <FlashBanner flash={flash} />
          </form>
        )}

        {viewMode === "list" && (
          <div className="section-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--ajs-navy)", marginBottom: "10px" }}>
              Daftar Kelas Terdaftar
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {classrooms.length === 0 ? (
                <div style={{ fontSize: "13px", color: "var(--ajs-muted)" }}>Belum ada data classroom.</div>
              ) : (
                classrooms.map((room) => (
                  <article key={room.id} style={{ border: "1px solid var(--ajs-border)", borderRadius: "var(--radius-sm)", padding: "12px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                      <div>
                        <strong style={{ fontSize: "14px", color: "var(--ajs-navy)" }}>{room.roomName}</strong>
                        <div style={{ fontSize: "12px", color: "var(--ajs-muted)", marginTop: "4px" }}>
                          Kapasitas: {room.capacity} orang • Session Terjadwal: {room.sessionCount}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: room.isAvailable ? "rgba(0,166,81,0.1)" : "rgba(227,30,36,0.1)", color: room.isAvailable ? "var(--ajs-green)" : "#dc2626" }}>
                          {room.isAvailable ? "Tersedia" : "Penuh"}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setEditingClassroomId(room.id); setExpandedClassroomId(null); }}
                          disabled={isPending || pendingKey !== null}
                          style={{ fontSize: "11px", fontWeight: "bold", color: "var(--ajs-teal)", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(room.id)}
                          disabled={isPending || pendingKey !== null}
                          style={{ fontSize: "11px", fontWeight: "bold", color: "#dc2626", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          {pendingKey === `delete-${room.id}` ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </div>

                    {editingClassroomId === room.id ? (
                      <form onSubmit={(e) => handleEditSubmit(e, room.id)} style={{ display: "grid", gap: "12px", marginTop: "12px", padding: "12px", background: "rgba(22, 33, 47, 0.05)", borderRadius: "4px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <label className="field-group">
                            <span className="field-label" style={{ fontSize: "12px" }}>Nama Ruang</span>
                            <input className="text-input" name="roomName" defaultValue={room.roomName} required style={{ fontSize: "12px", padding: "6px" }} />
                          </label>
                          <label className="field-group">
                            <span className="field-label" style={{ fontSize: "12px" }}>Kapasitas</span>
                            <input className="text-input" type="number" min={1} name="capacity" defaultValue={room.capacity} required style={{ fontSize: "12px", padding: "6px" }} />
                          </label>
                        </div>

                        <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: "var(--ajs-text)" }}>
                          <input type="checkbox" name="isAvailable" defaultChecked={room.isAvailable} />
                          Ruang tersedia
                        </label>

                        <div>
                          <h4 style={{ fontSize: "13px", color: "var(--ajs-navy)", margin: "0 0 8px 0" }}>Edit Checklist K3</h4>
                          <div style={{ display: "grid", gap: "8px", maxHeight: "200px", overflowY: "auto", padding: "8px", border: "1px solid var(--ajs-border)", borderRadius: "var(--radius-sm)", background: "#fff" }}>
                            {K3_FACILITIES_GROUPS.map((group) => (
                              <div key={group.category}>
                                <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--ajs-navy)", marginBottom: "4px" }}>{group.category}</div>
                                <div style={{ display: "grid", gap: "4px", paddingLeft: "8px" }}>
                                  {group.items.map((item) => (
                                    <label key={item} style={{ display: "flex", gap: "6px", alignItems: "start", fontSize: "11px", color: "var(--ajs-text)", cursor: "pointer" }}>
                                      <input type="checkbox" name="facilities" value={item} defaultChecked={room.facilities?.includes(item)} style={{ marginTop: "2px" }} />
                                      <span style={{ lineHeight: "1.3" }}>{item}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          <button type="submit" disabled={pendingKey === `edit-${room.id}`} style={{ flex: 1, padding: "8px", fontSize: "12px", backgroundColor: "var(--ajs-teal)", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                            {pendingKey === `edit-${room.id}` ? "Menyimpan..." : "Simpan Perubahan"}
                          </button>
                          <button type="button" onClick={() => setEditingClassroomId(null)} style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", border: "1px solid var(--ajs-border)", borderRadius: "4px", cursor: "pointer" }}>Batal</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ borderTop: "1px solid var(--ajs-border)", paddingTop: "8px", marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={() => setExpandedClassroomId(expandedClassroomId === room.id ? null : room.id)}
                          style={{ fontSize: "12px", background: "none", border: "none", color: "var(--ajs-teal)", cursor: "pointer", fontWeight: "bold", padding: 0 }}
                        >
                          {expandedClassroomId === room.id ? "Sembunyikan Checklist K3 ▲" : "Lihat Checklist K3 ▼"}
                        </button>

                        {expandedClassroomId === room.id && (
                          <div style={{ marginTop: "8px", padding: "8px", background: "#f8fafc", borderRadius: "4px", fontSize: "12px", color: "var(--ajs-text)" }}>
                            {(!room.facilities || room.facilities.length === 0) ? (
                              <span style={{ fontStyle: "italic", color: "var(--ajs-muted)" }}>Belum ada data checklist K3.</span>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: "16px" }}>
                                {room.facilities.map((fac, idx) => (
                                  <li key={idx} style={{ marginBottom: "4px" }}>{fac}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
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
