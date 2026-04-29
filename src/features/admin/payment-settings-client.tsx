"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Save, X, Building2 } from "lucide-react";
import { createPaymentSetting, updatePaymentSetting, deletePaymentSetting } from "./payment-settings.service";

type PaymentSetting = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string | null;
  isActive: boolean;
};

export function PaymentSettingsClient({ initialSettings }: { initialSettings: PaymentSetting[] }) {
  const router = useRouter();
  const [settings, setSettings] = useState<PaymentSetting[]>(initialSettings);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    instructions: "",
    isActive: true
  });

  const handleAddNew = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({ bankName: "", accountName: "", accountNumber: "", instructions: "", isActive: true });
  };

  const handleEdit = (setting: PaymentSetting) => {
    setIsEditing(setting.id);
    setIsAdding(false);
    setFormData({
      bankName: setting.bankName,
      accountName: setting.accountName,
      accountNumber: setting.accountNumber,
      instructions: setting.instructions || "",
      isActive: setting.isActive
    });
  };

  const handleSave = async () => {
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      return alert("Nama Bank, Nama Pemilik, dan Nomor Rekening wajib diisi!");
    }
    
    setLoading(true);
    try {
      if (isEditing) {
        await updatePaymentSetting(isEditing, formData);
      } else {
        await createPaymentSetting(formData);
      }
      setIsEditing(null);
      setIsAdding(false);
      router.refresh();
      // Optimistic update for immediate feedback could be done here, but router.refresh is safer
      window.location.reload();
    } catch (error) {
      alert("Gagal menyimpan pengaturan pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus rekening ini?")) return;
    setLoading(true);
    try {
      await deletePaymentSetting(id);
      setSettings(settings.filter(s => s.id !== id));
      router.refresh();
    } catch (error) {
      alert("Gagal menghapus rekening.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ajs-navy)', margin: '0 0 8px 0' }}>Pengaturan Rekening Pembayaran</h1>
          <p style={{ color: 'var(--ajs-muted)', margin: 0, fontSize: '14px' }}>Atur rekening tujuan transfer manual untuk peserta.</p>
        </div>
        {!isAdding && !isEditing && (
          <button onClick={handleAddNew} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Tambah Rekening
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="britsafe-card" style={{ padding: '30px', borderLeft: '4px solid var(--ajs-teal)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--ajs-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} /> {isEditing ? "Edit Rekening" : "Tambah Rekening Baru"}
          </h3>
          <div className="responsive-grid-2" style={{ marginTop: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Nama Bank (misal: BCA, Mandiri)</label>
              <input 
                type="text" 
                value={formData.bankName} 
                onChange={e => setFormData({...formData, bankName: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)' }}
                placeholder="Bank BCA"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Nomor Rekening</label>
              <input 
                type="text" 
                value={formData.accountNumber} 
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)', fontSize: '16px', fontWeight: '700', letterSpacing: '1px' }}
                placeholder="1234567890"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Atas Nama (Nama Pemilik Rekening)</label>
              <input 
                type="text" 
                value={formData.accountName} 
                onChange={e => setFormData({...formData, accountName: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)' }}
                placeholder="PT Arkama Jaya Sertifikasi"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Instruksi Tambahan (Opsional)</label>
              <textarea 
                value={formData.instructions} 
                onChange={e => setFormData({...formData, instructions: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)', minHeight: '80px' }}
                placeholder="Tambahkan kode unik 3 digit terakhir nomor HP Anda saat transfer..."
              />
            </div>
            {isEditing && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="isActive" style={{ fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Status Aktif (Tampilkan ke peserta)</label>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Rekening"}
            </button>
            <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="btn" style={{ border: '1px solid var(--ajs-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <X size={18} /> Batal
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {settings.length === 0 && !isAdding ? (
          <div className="britsafe-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--ajs-muted)' }}>
            <Building2 size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>Belum ada rekening yang diatur. Silakan tambah rekening baru.</p>
          </div>
        ) : (
          settings.map((setting) => (
            <div key={setting.id} className="britsafe-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: setting.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--ajs-gray)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ajs-navy)' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ajs-navy)' }}>{setting.bankName}</h3>
                    {!setting.isActive && <span style={{ fontSize: '11px', padding: '2px 8px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '12px', fontWeight: 'bold' }}>Nonaktif</span>}
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', letterSpacing: '1px' }}>{setting.accountNumber}</p>
                  <p style={{ margin: 0, color: 'var(--ajs-muted)', fontSize: '14px' }}>a/n <strong>{setting.accountName}</strong></p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleEdit(setting)}
                  className="btn" 
                  style={{ background: '#E3F2FD', color: '#1976D2', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(setting.id)}
                  className="btn" 
                  style={{ background: '#FFEBEE', color: '#D32F2F', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
