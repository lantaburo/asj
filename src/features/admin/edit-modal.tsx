"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  initialData: any;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "number" | "date" | "datetime-local" | "select" | "textarea" | "checkbox";
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
  }>;
};

export function EditModal({ isOpen, onClose, title, endpoint, initialData, fields }: EditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body: any = {};

    fields.forEach(field => {
      const val = formData.get(field.name) as string;
      if (field.type === "number") body[field.name] = val ? Number(val) : null;
      else if (field.type === "checkbox") body[field.name] = val === "on";
      else if (field.type === "datetime-local") {
        body[field.name] = val ? `${val}+08:00` : null;
      }
      else body[field.name] = val || null;
    });

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Gagal memperbarui data.");
      }

      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      backdropFilter: 'blur(12px)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        background: 'white',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 40px',
          background: 'linear-gradient(135deg, var(--ajs-navy), #1e293b)',
          position: 'relative',
          color: 'white'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            Edit {title}
          </h2>
          <p style={{ 
            fontSize: '14px', 
            opacity: 0.7, 
            margin: '8px 0 0 0' 
          }}>
            Perbarui informasi detail untuk entitas ini.
          </p>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '32px',
              right: '32px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ 
              padding: '16px', 
              background: 'rgba(227,30,36,0.05)', 
              color: 'var(--ajs-red)', 
              borderRadius: '16px', 
              fontSize: '14px',
              marginBottom: '24px',
              border: '1px solid rgba(227,30,36,0.1)',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
            {fields.map(field => (
              <label key={field.name} style={{ display: 'block' }}>
                <span style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: 'var(--ajs-navy)', 
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {field.label}
                </span>
                {field.type === "textarea" ? (
                  <textarea 
                    className="text-input" 
                    name={field.name} 
                    defaultValue={initialData[field.name]}
                    required={field.required}
                    rows={4}
                    style={{ borderRadius: '16px', padding: '16px' }}
                  />
                ) : field.type === "select" ? (
                  <select 
                    className="text-input" 
                    name={field.name} 
                    defaultValue={initialData[field.name]}
                    required={field.required}
                    style={{ borderRadius: '16px', padding: '0 16px', height: '52px' }}
                  >
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px',
                    background: 'var(--ajs-gray)',
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      name={field.name} 
                      defaultChecked={initialData[field.name]} 
                      style={{ width: '20px', height: '20px', accentColor: 'var(--ajs-navy)' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ajs-navy)' }}>Aktif / Publish</span>
                  </label>
                ) : (
                  <input 
                    className="text-input" 
                    type={field.type} 
                    name={field.name} 
                    defaultValue={field.type === "datetime-local" && initialData[field.name] ? new Date(new Date(initialData[field.name]).getTime() + 8 * 3600 * 1000).toISOString().slice(0, 16) : initialData[field.name]}
                    required={field.required}
                    style={{ borderRadius: '16px', padding: '0 16px', height: '52px' }}
                  />
                )}
              </label>
            ))}

            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginTop: '16px',
              paddingTop: '32px',
              borderTop: '1px solid var(--ajs-border)'
            }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ 
                  flex: 1, 
                  height: '56px',
                  borderRadius: '16px',
                  border: '1px solid var(--ajs-border)',
                  background: 'white',
                  fontWeight: 700,
                  color: 'var(--ajs-navy)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--ajs-gray)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  flex: 2, 
                  height: '56px',
                  borderRadius: '16px',
                  border: 'none',
                  background: isSubmitting ? 'var(--ajs-muted)' : 'var(--ajs-orange)',
                  fontWeight: 800,
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx>{`
        @keyframes modalEntrance {
          from { transform: scale(0.95) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
