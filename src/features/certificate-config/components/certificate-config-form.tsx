"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2 } from "lucide-react";

type ConfigData = {
  programId?: string | null;
  pdfTemplateUrl: string | null;
  signatureUrl: string | null;
  signatoryName: string | null;
  signatoryTitle: string | null;
  passingGrade: number;
  validityMonths: number | null;
};

export function CertificateConfigForm({ initialData, programs }: { initialData: ConfigData, programs: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("GLOBAL");

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ConfigData>({
    programId: initialData.programId || null,
    pdfTemplateUrl: initialData.pdfTemplateUrl || "",
    signatureUrl: initialData.signatureUrl || "",
    signatoryName: initialData.signatoryName || "",
    signatoryTitle: initialData.signatoryTitle || "",
    passingGrade: initialData.passingGrade || 70,
    validityMonths: initialData.validityMonths || 36,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const res = await fetch("/api/certificate-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: selectedProgramId === "GLOBAL" ? null : selectedProgramId,
          pdfTemplateUrl: formData.pdfTemplateUrl || null,
          signatureUrl: formData.signatureUrl || null,
          signatoryName: formData.signatoryName || null,
          signatoryTitle: formData.signatoryTitle || null,
          passingGrade: Number(formData.passingGrade),
          validityMonths: formData.validityMonths ? Number(formData.validityMonths) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal menyimpan pengaturan");

      setNotification({ type: "success", message: "Pengaturan sertifikat berhasil disimpan." });
      router.refresh();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async (progId: string) => {
    setSelectedProgramId(progId);
    setLoading(true);
    setNotification(null);
    try {
      const qs = progId === "GLOBAL" ? "" : `?programId=${progId}`;
      const res = await fetch(`/api/certificate-config${qs}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setFormData({
          programId: data.data.programId,
          pdfTemplateUrl: data.data.pdfTemplateUrl || "",
          signatureUrl: data.data.signatureUrl || "",
          signatoryName: data.data.signatoryName || "",
          signatoryTitle: data.data.signatoryTitle || "",
          passingGrade: data.data.passingGrade || 70,
          validityMonths: data.data.validityMonths || "",
        });
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, type: "pdf" | "signature") => {
    if (!file) return;

    if (type === "pdf") setUploadingPdf(true);
    else setUploadingSignature(true);
    setNotification(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/certificate-config/upload", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error?.message || "Gagal mengunggah file");

      setFormData((prev) => ({
        ...prev,
        [type === "pdf" ? "pdfTemplateUrl" : "signatureUrl"]: resData.url,
      }));
      setNotification({ type: "success", message: `File ${type === "pdf" ? "PDF" : "Tanda Tangan"} berhasil diunggah.` });
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      if (type === "pdf") setUploadingPdf(false);
      else setUploadingSignature(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      {notification && (
        <div className={notification.type === "success" ? "success-banner" : "error-banner"} style={notification.type === "success" ? { background: "rgba(5,150,105,0.1)", color: "#059669", padding: "12px", borderRadius: "8px", border: "1px solid rgba(5,150,105,0.2)", marginBottom: "20px" } : { marginBottom: "20px" }}>
          {notification.message}
        </div>
      )}

      <label className="field-group">
        <span className="field-label">Target Pengaturan</span>
        <select 
          className="text-input" 
          value={selectedProgramId} 
          onChange={(e) => loadConfig(e.target.value)}
          disabled={loading}
        >
          <option value="GLOBAL">Pengaturan Global Default (Fallback)</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>Program Khusus: {p.title}</option>
          ))}
        </select>
        <span className="field-helper">Pilih "Global" untuk standar dasar, atau timpa pengaturan pada program tertentu.</span>
      </label>

      <label className="field-group">
        <span className="field-label">Template PDF Sertifikat (URL)</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="url"
            className="text-input"
            style={{ flex: 1, margin: 0 }}
            value={formData.pdfTemplateUrl || ""}
            onChange={(e) => setFormData({ ...formData, pdfTemplateUrl: e.target.value })}
            placeholder="https://example.com/template.pdf"
          />
          <input
            type="file"
            accept="application/pdf"
            ref={pdfInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0], "pdf");
            }}
          />
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, whiteSpace: 'nowrap', color: '#283593' }}
            disabled={uploadingPdf}
            onClick={() => pdfInputRef.current?.click()}
          >
            {uploadingPdf ? "Mengunggah..." : <><UploadCloud size={16} /> Unggah File</>}
          </button>
        </div>
        {formData.pdfTemplateUrl && formData.pdfTemplateUrl.startsWith("/uploads/") && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '14px', marginTop: '4px' }}>
            <CheckCircle2 size={16} /> File lokal terunggah dan siap digunakan.
          </div>
        )}
        <span className="field-helper">URL file PDF yang akan digunakan sebagai background sertifikat.</span>
      </label>

      <label className="field-group">
        <span className="field-label">Tanda Tangan Digital (URL Gambar)</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="url"
            className="text-input"
            style={{ flex: 1, margin: 0 }}
            value={formData.signatureUrl || ""}
            onChange={(e) => setFormData({ ...formData, signatureUrl: e.target.value })}
            placeholder="https://example.com/signature.png"
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            ref={signatureInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0], "signature");
            }}
          />
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, whiteSpace: 'nowrap', color: '#283593' }}
            disabled={uploadingSignature}
            onClick={() => signatureInputRef.current?.click()}
          >
            {uploadingSignature ? "Mengunggah..." : <><UploadCloud size={16} /> Unggah File</>}
          </button>
        </div>
        {formData.signatureUrl && formData.signatureUrl.startsWith("/uploads/") && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '14px', marginTop: '4px' }}>
            <CheckCircle2 size={16} /> Gambar lokal terunggah dan siap digunakan.
          </div>
        )}
        <span className="field-helper">URL gambar transparan (PNG) untuk tanda tangan direktur/asesor.</span>
      </label>

      <label className="field-group">
        <span className="field-label">Nama Penanda Tangan</span>
        <input
          type="text"
          className="text-input"
          value={formData.signatoryName || ""}
          onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
          placeholder="Jhon Doe, M.T."
        />
        <span className="field-helper">Nama lengkap beserta gelar dari penandatangan sertifikat.</span>
      </label>

      <label className="field-group">
        <span className="field-label">Jabatan Penanda Tangan</span>
        <input
          type="text"
          className="text-input"
          value={formData.signatoryTitle || ""}
          onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
          placeholder="Direktur Utama / Asesor Kepala"
        />
        <span className="field-helper">Jabatan dari penandatangan (misal: Direktur Utama).</span>
      </label>

      <label className="field-group">
        <span className="field-label">Masa Berlaku (Bulan)</span>
        <input
          type="number"
          className="text-input"
          min="0"
          value={formData.validityMonths || ""}
          onChange={(e) => setFormData({ ...formData, validityMonths: parseInt(e.target.value, 10) || null })}
          placeholder="Contoh: 36 untuk 3 tahun"
        />
        <span className="field-helper">Masa berlaku sertifikat dalam hitungan bulan (kosongkan jika berlaku selamanya).</span>
      </label>

      <label className="field-group">
        <span className="field-label">Passing Grade Kelulusan (%)</span>
        <input
          type="number"
          className="text-input"
          min="0"
          max="100"
          value={formData.passingGrade}
          onChange={(e) => setFormData({ ...formData, passingGrade: parseInt(e.target.value, 10) || 0 })}
          required
        />
        <span className="field-helper">Nilai minimum logbook atau ujian agar peserta dinyatakan kompeten.</span>
      </label>

      <button type="submit" className="cta-primary" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
