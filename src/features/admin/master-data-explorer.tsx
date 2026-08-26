"use client";

import { useState } from "react";
import { CrudActions } from "@/features/admin/crud-actions";
import { formatCurrency, formatDateRange } from "@/features/landing-page/landing-page.service";

type ExplorerProps = {
  programs: any[];
  batches: any[];
  sessions: any[];
  classrooms: any[];
  instructors: any[];
};

export function MasterDataExplorer({ programs, batches, sessions, classrooms, instructors }: ExplorerProps) {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const selectedProgram = programs.find(p => p.id === selectedProgramId);
  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  const filteredBatches = batches.filter(b => b.program?.id === selectedProgramId);
  const filteredSessions = sessions.filter(s => s.batch?.id === selectedBatchId);

  return (
    <div className="britsafe-card" style={{ padding: '32px', background: 'white' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', fontSize: '13px' }}>
        <button 
          onClick={() => { setLevel(1); setSelectedProgramId(null); setSelectedBatchId(null); }}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: level === 1 ? 'var(--ajs-orange)' : 'var(--ajs-muted)', 
            fontWeight: 700, 
            cursor: 'pointer',
            padding: 0
          }}
        >
          PROGRAMS
        </button>
        
        {level >= 2 && (
          <>
            <span style={{ color: 'var(--ajs-border)' }}>/</span>
            <button 
              onClick={() => { setLevel(2); setSelectedBatchId(null); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: level === 2 ? 'var(--ajs-orange)' : 'var(--ajs-muted)', 
                fontWeight: 700, 
                cursor: 'pointer',
                padding: 0,
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {selectedProgram?.title?.toUpperCase()}
            </button>
          </>
        )}

        {level === 3 && (
          <>
            <span style={{ color: 'var(--ajs-border)' }}>/</span>
            <span style={{ color: 'var(--ajs-orange)', fontWeight: 700 }}>
              BATCH {selectedBatchId?.slice(-4).toUpperCase()}
            </span>
          </>
        )}
      </div>

      {/* Level 1: Program List */}
      {level === 1 && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {programs.map(p => {
            const pBatches = batches.filter(b => b.program?.id === p.id);
            const stats = {
              total: pBatches.length,
              ongoing: pBatches.filter(b => b.status === "ONGOING").length,
              completed: pBatches.filter(b => b.status === "COMPLETED").length,
              upcoming: pBatches.filter(b => b.status === "OPEN").length
            };

            return (
              <div 
                key={p.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '24px', 
                  border: '1px solid var(--ajs-border)', 
                  borderRadius: '16px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  background: 'white'
                }}
                className="hover-card"
                onClick={() => { setSelectedProgramId(p.id); setLevel(2); }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', background: 'var(--ajs-gray)', color: 'var(--ajs-navy)' }}>
                      {p.category}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ajs-navy)', margin: 0 }}>{p.title}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ajs-muted)' }}>
                    <span>Total: <strong>{stats.total} Batch</strong></span>
                    {stats.ongoing > 0 && <span style={{ color: 'var(--ajs-orange)' }}>● <strong>{stats.ongoing} Berjalan</strong></span>}
                    {stats.completed > 0 && <span style={{ color: 'var(--ajs-green)' }}>✓ <strong>{stats.completed} Selesai</strong></span>}
                    {stats.upcoming > 0 && <span>○ <strong>{stats.upcoming} Mendatang</strong></span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: p.isActive ? 'rgba(0,166,81,0.1)' : 'rgba(227,30,36,0.1)', color: p.isActive ? 'var(--ajs-green)' : 'var(--ajs-red)' }}>
                    {p.isActive ? "AKTIF" : "NONAKTIF"}
                  </span>
                <CrudActions 
                  endpoint={`/api/programs/${p.id}`} 
                  itemName="Program" 
                  initialData={p}
                  editFields={[
                    { name: "title", label: "Judul Program", type: "text", required: true },
                    { name: "category", label: "Kategori", type: "select", options: [
                      { value: "BNSP", label: "BNSP" },
                      { value: "KEMENAKER", label: "KEMENAKER" },
                      { value: "INHOUSE", label: "INHOUSE" },
                      { value: "SERTIFIKASI", label: "SERTIFIKASI" },
                      { value: "AUDIT", label: "AUDIT" },
                      { value: "LAINNYA", label: "LAINNYA" }
                    ]},
                    { name: "industryType", label: "Tipe Industri", type: "text" },
                    { name: "isActive", label: "Status Aktif", type: "checkbox" }
                  ]}
                />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Level 2: Batch List */}
      {level === 2 && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <button 
              onClick={() => { setLevel(1); setSelectedProgramId(null); }}
              style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ajs-navy)', background: 'var(--ajs-gray)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Kembali ke Daftar Program
            </button>
          </div>
          {filteredBatches.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--ajs-muted)', background: 'var(--ajs-gray)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '15px' }}>Belum ada batch untuk program ini.</div>
              <button 
                onClick={() => {
                  const el = document.getElementById("master-data-form");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  window.dispatchEvent(new CustomEvent("ajs-open-wizard", { detail: { step: "batch" } }));
                }}
                className="cta-primary" 
                style={{ padding: '10px 24px', fontSize: '13px' }}
              >
                + Buat Batch Baru
              </button>
            </div>
          ) : (
            filteredBatches.map(b => (
              <div 
                key={b.id} 
                style={{ 
                  padding: '24px', 
                  border: '1px solid var(--ajs-border)', 
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-card"
                onClick={() => { setSelectedBatchId(b.id); setLevel(3); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ajs-orange)' }}>
                    {(b as any).title ? `${(b as any).title} (${formatDateRange(new Date(b.startDate), new Date(b.endDate))})` : formatDateRange(new Date(b.startDate), new Date(b.endDate))}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: b.status === "ARCHIVED" ? 'var(--ajs-border)' : 'var(--ajs-navy)', color: b.status === "ARCHIVED" ? 'var(--ajs-muted)' : 'white' }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px dashed var(--ajs-border)' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ fontSize: '13px', color: 'var(--ajs-muted)' }}>
                    Quota: <strong>{b.quota}</strong> • Harga: <strong>{formatCurrency(b.price)}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {(b.status === "COMPLETED" || b.status === "CLOSED") && (
                      <CrudActions 
                        endpoint={`/api/batches/${b.id}`} 
                        itemName="Batch" 
                        initialData={{ ...b, status: "ARCHIVED" }}
                        variant="archive"
                        editFields={[]}
                      />
                    )}
                    <CrudActions 
                      endpoint={`/api/batches/${b.id}`} 
                      itemName="Batch" 
                      initialData={b}
                      editFields={[
                        { name: "title", label: "Nama Batch (Opsional)", type: "text" },
                        { name: "startDate", label: "Tanggal Mulai", type: "datetime-local", required: true },
                        { name: "endDate", label: "Tanggal Selesai", type: "datetime-local", required: true },
                        { name: "quota", label: "Kuota Peserta", type: "number", required: true },
                        { name: "price", label: "Harga Dasar", type: "number" },
                        { name: "status", label: "Status Batch", type: "select", options: [
                          { value: "OPEN", label: "Open (Pendaftaran)" },
                          { value: "ONGOING", label: "Ongoing (Berjalan)" },
                          { value: "COMPLETED", label: "Completed (Selesai)" },
                          { value: "CLOSED", label: "Closed (Ditutup)" },
                          { value: "ARCHIVED", label: "Archived (Arsip)" }
                        ]}
                      ]}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Level 3: Session List */}
      {level === 3 && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <button 
              onClick={() => { setLevel(2); setSelectedBatchId(null); }}
              style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ajs-navy)', background: 'var(--ajs-gray)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Kembali ke Daftar Batch
            </button>
          </div>
          {filteredSessions.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--ajs-muted)', background: 'var(--ajs-gray)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '15px' }}>Belum ada sesi untuk batch ini.</div>
              <button 
                onClick={() => {
                  const el = document.getElementById("master-data-form");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  window.dispatchEvent(new CustomEvent("ajs-open-wizard", { detail: { step: "session" } }));
                }}
                className="cta-primary" 
                style={{ padding: '10px 24px', fontSize: '13px' }}
              >
                + Buat Sesi Baru
              </button>
            </div>
          ) : (
            filteredSessions.map(s => (
              <div 
                key={s.id} 
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  padding: '20px 24px', 
                  border: '1px solid var(--ajs-border)', 
                  borderRadius: '16px' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ajs-navy)', margin: '0 0 4px 0' }}>{s.title}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--ajs-muted)' }}>
                      {new Date(s.sessionDate).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })} • 
                      {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ajs-green)', fontWeight: 700, padding: '4px 8px', background: 'rgba(0,166,81,0.1)', borderRadius: '4px' }}>
                    {s.attendanceCount} hadir
                  </span>
                  <a href={`/admin/sessions/${s.id}/docking`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ajs-orange)' }}>
                    Launch Docking QR
                  </a>
                  <CrudActions 
                    endpoint={`/api/sessions/${s.id}`} 
                    itemName="Session" 
                    initialData={s}
                    editFields={[
                      { name: "title", label: "Judul Sesi", type: "text", required: true },
                      { name: "sessionDate", label: "Tanggal Sesi", type: "datetime-local", required: true },
                      { name: "startTime", label: "Waktu Mulai", type: "datetime-local", required: true },
                      { name: "endTime", label: "Waktu Selesai", type: "datetime-local", required: true },
                      { name: "classroomId", label: "Ruang Kelas", type: "select", options: [
                        { value: "", label: "--- Pilih Ruang Kelas ---" },
                        ...classrooms.map(c => ({ value: c.id, label: c.roomName }))
                      ]},
                      { name: "instructorId", label: "Instruktur", type: "select", options: [
                        { value: "", label: "--- Pilih Instruktur ---" },
                        ...instructors.map(i => ({ value: i.id, label: i.fullName }))
                      ]}
                    ]}
                  />
                </div>
                </div>
                
                <details style={{ width: '100%' }}>
                  <summary style={{ fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--ajs-orange)', userSelect: 'none' }}>
                    Lihat Data Peserta Hadir
                  </summary>
                  <div style={{ marginTop: '12px', padding: '16px', background: 'var(--ajs-gray)', borderRadius: '12px', fontSize: '12px' }}>
                    {(!s.attendances || s.attendances.length === 0) ? (
                      <div style={{ color: 'var(--ajs-muted)' }}>Belum ada peserta yang memindai QR Code untuk sesi ini.</div>
                    ) : (
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--ajs-border)' }}>
                            <th style={{ padding: '8px 12px', color: 'var(--ajs-navy)' }}>Peserta</th>
                            <th style={{ padding: '8px 12px', color: 'var(--ajs-navy)' }}>Waktu Check-in</th>
                            <th style={{ padding: '8px 12px', color: 'var(--ajs-navy)' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.attendances.map((a: any) => (
                            <tr key={a.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                              <td style={{ padding: '8px 12px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--ajs-navy)' }}>{a.userName}</div>
                                <div style={{ fontSize: '10px', color: 'var(--ajs-muted)' }}>{a.userEmail}</div>
                              </td>
                              <td style={{ padding: '8px 12px' }}>{new Date(a.checkInTime).toLocaleTimeString('id-ID')}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ padding: '2px 6px', background: 'rgba(0,166,81,0.1)', color: 'var(--ajs-green)', borderRadius: '4px', fontWeight: 700 }}>
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </details>

              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .hover-card:hover {
          background: var(--ajs-gray);
          border-color: var(--ajs-orange) !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
