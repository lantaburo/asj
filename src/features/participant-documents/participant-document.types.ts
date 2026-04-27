export const participantDocumentTypeOptions = [
  "KTP",
  "PAS_FOTO",
  "IJAZAH",
  "SERTIFIKAT",
  "CV",
  "SURAT_KERJA",
  "LAINNYA"
] as const;

export type ParticipantDocumentType = (typeof participantDocumentTypeOptions)[number];

export type ParticipantDocumentRecord = {
  id: string;
  type: ParticipantDocumentType;
  customLabel: string | null;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  expiryDate: string | null;
};

export const participantDocumentTypeLabels: Record<ParticipantDocumentType, string> = {
  KTP: "KTP / Identitas",
  PAS_FOTO: "Pas Foto",
  IJAZAH: "Ijazah",
  SERTIFIKAT: "Sertifikat Pendukung",
  CV: "CV",
  SURAT_KERJA: "Surat Keterangan Kerja",
  LAINNYA: "Dokumen Lainnya"
};
