"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditModal } from "@/features/admin/edit-modal";

export function CrudActions({
  endpoint,
  itemName,
  compact = false,
  initialData,
  editFields,
  variant = "default"
}: {
  endpoint: string;
  itemName: string;
  compact?: boolean;
  initialData?: any;
  editFields?: Array<{
    name: string;
    label: string;
    type: "text" | "number" | "date" | "datetime-local" | "select" | "textarea" | "checkbox";
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
  }>;
  variant?: "default" | "archive";
}) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${itemName} ini? Data yang terkait mungkin akan ikut terhapus.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal menghapus data.");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(`Apakah Anda yakin ingin mengarsipkan ${itemName} ini? Status akan diubah menjadi ARCHIVED.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal mengarsipkan data.");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (variant === "archive") {
    return (
      <button
        onClick={handleArchive}
        disabled={isProcessing}
        style={{
          fontSize: "12px",
          padding: "6px 12px",
          background: "var(--ajs-border)",
          color: "var(--ajs-navy)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          fontWeight: 700,
          cursor: isProcessing ? "not-allowed" : "pointer",
          opacity: isProcessing ? 0.7 : 1
        }}
      >
        {isProcessing ? "..." : "Arsip"}
      </button>
    );
  }

  return (
    <>
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        marginTop: compact ? "0" : "16px", 
        paddingTop: compact ? "0" : "16px", 
        borderTop: compact ? "none" : "1px solid var(--ajs-border)" 
      }}>
        {!compact && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            style={{ 
              flex: 1, 
              fontSize: "12px", 
              padding: "6px",
              background: 'var(--ajs-gray)',
              color: '#283593',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isProcessing}
          style={{
            flex: compact ? "0 0 auto" : 1,
            fontSize: compact ? "10px" : "12px",
            padding: compact ? "4px 8px" : "6px",
            background: "var(--ajs-red)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: isProcessing ? "not-allowed" : "pointer",
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          {isProcessing ? "..." : (compact ? "Hapus" : "Hapus")}
        </button>
      </div>

      {isEditModalOpen && initialData && editFields && (
        <EditModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={itemName}
          endpoint={endpoint}
          initialData={initialData}
          fields={editFields}
        />
      )}
    </>
  );
}
