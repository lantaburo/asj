import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Prisma } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import {
  getParticipantDocumentState,
  updateParticipantDocumentState
} from "@/features/participant-documents/participant-document.repository";
import type {
  ParticipantDocumentRecord,
  ParticipantDocumentType
} from "@/features/participant-documents/participant-document.types";
import { participantDocumentTypeOptions } from "@/features/participant-documents/participant-document.types";
import { ensureActiveUser } from "@/features/users/user.service";

const STORAGE_ROOT = path.join(
  process.cwd(),
  "public",
  "uploads",
  "participant-documents"
);
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeExpiryDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new AppError("Tanggal berlaku dokumen tidak valid.", {
      statusCode: 400,
      code: "PARTICIPANT_DOCUMENT_EXPIRY_INVALID"
    });
  }

  return trimmed;
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "document";
}

function isParticipantDocumentType(value: string): value is ParticipantDocumentType {
  return participantDocumentTypeOptions.includes(value as ParticipantDocumentType);
}

function normalizeParticipantDocuments(value: unknown): ParticipantDocumentRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.type !== "string" ||
      !isParticipantDocumentType(candidate.type) ||
      typeof candidate.fileName !== "string" ||
      typeof candidate.fileUrl !== "string" ||
      typeof candidate.storageKey !== "string" ||
      typeof candidate.mimeType !== "string" ||
      typeof candidate.sizeBytes !== "number" ||
      typeof candidate.uploadedAt !== "string"
    ) {
      return [];
    }

    return [
      {
        id: candidate.id,
        type: candidate.type,
        customLabel:
          typeof candidate.customLabel === "string" ? candidate.customLabel : null,
        fileName: candidate.fileName,
        fileUrl: candidate.fileUrl,
        storageKey: candidate.storageKey,
        mimeType: candidate.mimeType,
        sizeBytes: candidate.sizeBytes,
        uploadedAt: candidate.uploadedAt,
        expiryDate:
          typeof candidate.expiryDate === "string" ? candidate.expiryDate : null
      }
    ];
  });
}

async function writeParticipantDocumentFile(
  userId: string,
  documentId: string,
  file: File
) {
  const safeFileName = sanitizeFileName(file.name);
  const storageKey = path.posix.join(
    "uploads",
    "participant-documents",
    userId,
    `${documentId}-${safeFileName}`
  );
  const absolutePath = path.join(process.cwd(), "public", storageKey);

  await mkdir(path.dirname(absolutePath), {
    recursive: true
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    storageKey,
    fileUrl: `/${storageKey}`
  };
}

async function removeParticipantDocumentFile(storageKey: string) {
  const absolutePath = path.join(process.cwd(), "public", storageKey);

  try {
    await unlink(absolutePath);
  } catch (error: unknown) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }
}

function ensureParticipantFile(file: FormDataEntryValue | null): File {
  if (!(file instanceof File)) {
    throw new AppError("File dokumen wajib dipilih.", {
      statusCode: 400,
      code: "PARTICIPANT_DOCUMENT_FILE_REQUIRED"
    });
  }

  if (file.size <= 0) {
    throw new AppError("File dokumen kosong atau gagal dibaca.", {
      statusCode: 400,
      code: "PARTICIPANT_DOCUMENT_FILE_EMPTY"
    });
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new AppError("Ukuran file maksimal 8 MB per dokumen.", {
      statusCode: 413,
      code: "PARTICIPANT_DOCUMENT_FILE_TOO_LARGE"
    });
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new AppError("Format file harus PDF, JPG, PNG, atau WEBP.", {
      statusCode: 415,
      code: "PARTICIPANT_DOCUMENT_FILE_UNSUPPORTED"
    });
  }

  return file;
}

function ensureParticipantDocumentType(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !isParticipantDocumentType(value)) {
    throw new AppError("Tipe dokumen peserta tidak valid.", {
      statusCode: 400,
      code: "PARTICIPANT_DOCUMENT_TYPE_INVALID"
    });
  }

  return value;
}

export async function getParticipantDocuments(userId: string) {
  await ensureActiveUser(userId);
  const state = await getParticipantDocumentState(userId);
  return normalizeParticipantDocuments(state?.participantDocuments);
}

export async function uploadParticipantDocument(formData: FormData, userId: string) {
  await ensureActiveUser(userId);
  const type = ensureParticipantDocumentType(formData.get("type"));
  const file = ensureParticipantFile(formData.get("file"));
  const customLabel = normalizeOptionalText(formData.get("customLabel"));
  const expiryDate = normalizeExpiryDate(formData.get("expiryDate"));
  const documents = await getParticipantDocuments(userId);
  const documentId = randomUUID();
  const storedFile = await writeParticipantDocumentFile(userId, documentId, file);

  const document: ParticipantDocumentRecord = {
    id: documentId,
    type,
    customLabel,
    fileName: file.name,
    fileUrl: storedFile.fileUrl,
    storageKey: storedFile.storageKey,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    expiryDate
  };

  const nextDocuments = [document, ...documents];
  await updateParticipantDocumentState(
    userId,
    nextDocuments as unknown as Prisma.InputJsonValue
  );

  return {
    document,
    documents: nextDocuments
  };
}

export async function deleteParticipantDocument(documentId: string, userId: string) {
  await ensureActiveUser(userId);
  const documents = await getParticipantDocuments(userId);
  const document = documents.find((item) => item.id === documentId);

  if (!document) {
    throw new AppError("Dokumen peserta tidak ditemukan.", {
      statusCode: 404,
      code: "PARTICIPANT_DOCUMENT_NOT_FOUND"
    });
  }

  const nextDocuments = documents.filter((item) => item.id !== documentId);
  await updateParticipantDocumentState(
    userId,
    nextDocuments as unknown as Prisma.InputJsonValue
  );
  await removeParticipantDocumentFile(document.storageKey);

  return {
    documentId,
    documents: nextDocuments
  };
}

export async function buildParticipantDocumentRegistrationSnapshot(userId: string) {
  const documents = await getParticipantDocuments(userId);

  return {
    status: documents.length > 0 ? "ready" : "pending",
    source: "participant-document-bank",
    snapshotAt: new Date().toISOString(),
    documentCount: documents.length,
    documents: documents.map((document) => ({
      id: document.id,
      type: document.type,
      customLabel: document.customLabel,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      uploadedAt: document.uploadedAt,
      expiryDate: document.expiryDate
    }))
  };
}
