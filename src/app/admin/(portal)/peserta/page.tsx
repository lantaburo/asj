import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser, canAccessAdminPortal } from "@/features/auth/auth.service";
import { participantDocumentTypeLabels } from "@/features/participant-documents/participant-document.types";
import type { ParticipantDocumentRecord } from "@/features/participant-documents/participant-document.types";
import { PesertaAdminClient } from "./peserta-admin-client";

export const dynamic = "force-dynamic";

async function getAllParticipantsWithDocs() {
  const users = await prisma.user.findMany({
    where: { role: "TRAINEE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      participantDocuments: true,
      createdAt: true,
      enrollments: {
        include: {
          batch: {
            include: {
              program: { select: { id: true, title: true, category: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt.toISOString(),
    documents: (u.participantDocuments as ParticipantDocumentRecord[] | null) ?? [],
    enrollments: u.enrollments.map((e) => ({
      id: e.id,
      programId: e.batch.program.id,
      programTitle: e.batch.program.title,
      batchId: e.batch.id,
      startDate: e.batch.startDate.toISOString(),
      endDate: e.batch.endDate.toISOString(),
      assessmentStatus: e.assessmentStatus,
    })),
  }));
}

async function getProgramsWithBatchesAndParticipants() {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      batches: {
        orderBy: { startDate: "asc" },
        include: {
          enrollments: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  participantDocuments: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  return programs.map((p) => ({
    id: p.id,
    title: p.title,
    batches: p.batches.map((b) => ({
      id: b.id,
      title: b.title,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      status: b.status,
      participants: b.enrollments.map((e) => ({
        enrollmentId: e.id,
        assessmentStatus: e.assessmentStatus,
        userId: e.user.id,
        fullName: e.user.fullName,
        email: e.user.email,
        phone: e.user.phone,
        documents: (e.user.participantDocuments as ParticipantDocumentRecord[] | null) ?? [],
      })),
    })),
  }));
}

export default async function AdminPesertaPage() {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || !canAccessAdminPortal(currentUser.role)) redirect("/masuk");

  const [allParticipants, programsWithBatches] = await Promise.all([
    getAllParticipantsWithDocs(),
    getProgramsWithBatchesAndParticipants(),
  ]);

  return (
    <PesertaAdminClient
      allParticipants={allParticipants}
      programsWithBatches={programsWithBatches}
      documentTypeLabels={participantDocumentTypeLabels}
    />
  );
}
