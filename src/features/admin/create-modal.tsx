"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type CreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  defaultValues?: any;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "number" | "date" | "datetime-local" | "select" | "textarea" | "checkbox";
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
  }>;
};

export function CreateModal({ isOpen, onClose, title, endpoint, defaultValues = {}, fields }: CreateModalProps) {
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
    const body: any = { ...defaultValues };

    fields.forEach(field => {
      const val = formData.get(field.name);
      if (field.type === "number") body[field.name] = val ? Number(val) : null;
      else if (field.type === "checkbox") body[field.name] = val === "on";
      else body[field.name] = val || null;
    });

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Gagal menyimpan data.");
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
          background: 'linear-gradient(135deg, var(--ajs-green), #0f5132)',
          position: 'relative',
          color: 'white'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            Tambah {title}
          </h2>
          <p style={{ 
            fontSize: '14px', 
            opacity: 0.9, 
            margin: '8px 0 0 0' 
          }}>
            Lengkapi form di bawah untuk membuat data baru.
          </p>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '32px',
              right: '32px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
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
                    required={field.required}
                    rows={4}
                    style={{ borderRadius: '16px', padding: '16px', width: "100%" }}
                  />
                ) : field.type === "select" ? (
                  <select 
                    className="text-input" 
                    name={field.name} 
                    required={field.required}
                    style={{ borderRadius: '16px', padding: '0 16px', height: '52px', width: "100%" }}
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
                      style={{ width: '20px', height: '20px', accentColor: 'var(--ajs-navy)' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ajs-navy)' }}>Ya</span>
                  </label>
                ) : (
                  <input 
                    className="text-input" 
                    type={field.type} 
                    name={field.name} 
                    required={field.required}
                    style={{ borderRadius: '16px', padding: '0 16px', height: '52px', width: "100%" }}
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
                  background: isSubmitting ? 'var(--ajs-muted)' : 'var(--ajs-green)',
                  fontWeight: 800,
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(0, 166, 81, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? "Menyimpan..." : "Tambah Data"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
