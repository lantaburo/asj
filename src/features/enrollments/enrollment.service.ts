import { AssessmentStatus, Prisma } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import {
  syncBatchStatuses
} from "@/features/batches/batch.repository";
import { enrollmentAssessmentUpdateSchema } from "@/features/enrollments/enrollment-assessment.schema";
import { enrollmentCreateSchema } from "@/features/enrollments/enrollment.schema";
import { buildParticipantDocumentRegistrationSnapshot } from "@/features/participant-documents/participant-document.service";
import {
  createEnrollmentInOpenBatch,
  findEnrollmentById,
  findEnrollmentByVerificationCode,
  listEnrollmentsByUser,
  listEnrollmentsAdmin,
  updateEnrollmentAssessment,
  deleteEnrollment
} from "@/features/enrollments/enrollment.repository";
import {
  ensureActiveUser,
  ensureVerifierUser
} from "@/features/users/user.service";
import { fetchCertificateConfig } from "@/features/certificate-config/certificate-config.service";

function hasUniqueConstraintTarget(target: unknown, fields: string[]) {
  const targetValues = Array.isArray(target)
    ? target.map((value) => String(value))
    : typeof target === "string"
      ? [target]
      : [];

  return fields.every((field) =>
    targetValues.some((targetValue) => targetValue.includes(field))
  );
}

function mapEnrollment(enrollment: Awaited<ReturnType<typeof listEnrollmentsAdmin>>[number]) {
  return {
    id: enrollment.id,
    assessmentStatus: enrollment.assessmentStatus,
    certificateNum: enrollment.certificateNum,
    expiryDate: enrollment.expiryDate?.toISOString() ?? null,
    qrVerifyCode: enrollment.qrVerifyCode,
    registrationDocs: enrollment.registrationDocs,
    createdAt: enrollment.createdAt.toISOString(),
    user: {
      id: enrollment.user.id,
      fullName: enrollment.user.fullName,
      email: enrollment.user.email,
    },
    batch: {
      id: enrollment.batch.id,
      status: enrollment.batch.status,
      startDate: enrollment.batch.startDate.toISOString(),
      endDate: enrollment.batch.endDate.toISOString(),
      instructor: enrollment.batch.instructor,
      assessor: enrollment.batch.assessor,
      program: {
        title: enrollment.batch.program.title,
      }
    },
    k3LogCount: enrollment._count.k3Logs
  };
}

function mapParticipantEnrollment(
  enrollment: Awaited<ReturnType<typeof listEnrollmentsByUser>>[number]
) {
  return {
    id: enrollment.id,
    assessmentStatus: enrollment.assessmentStatus,
    certificateNum: enrollment.certificateNum,
    expiryDate: enrollment.expiryDate?.toISOString() ?? null,
    qrVerifyCode: enrollment.qrVerifyCode,
    createdAt: enrollment.createdAt.toISOString(),
    k3LogCount: enrollment._count.k3Logs,
    batch: {
      id: enrollment.batch.id,
      status: enrollment.batch.status,
      startDate: enrollment.batch.startDate.toISOString(),
      endDate: enrollment.batch.endDate.toISOString()
    },
    program: {
      id: enrollment.batch.program.id,
      title: enrollment.batch.program.title,
      category: enrollment.batch.program.category,
      industryType: enrollment.batch.program.industryType
    }
  };
}

function buildCertificateNumber(enrollmentId: string) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const shortId = enrollmentId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `AJS-K3-${stamp}-${shortId}`;
}

export async function registerEnrollment(payload: unknown, currentUserId: string) {
  const parsed = enrollmentCreateSchema.parse(payload);
  await syncBatchStatuses();
  const user = await ensureActiveUser(currentUserId);
  const registrationDocs = parsed.registrationDocs
    ? (parsed.registrationDocs as Prisma.InputJsonValue)
    : (await buildParticipantDocumentRegistrationSnapshot(user.id)) as Prisma.InputJsonValue;

  try {
    const result = await createEnrollmentInOpenBatch({
      batchId: parsed.batchId,
      userId: user.id,
      registrationDocs
    });

    if (result.status === "batch_not_open") {
      throw new AppError("Batch tidak ditemukan atau tidak terbuka untuk pendaftaran.", {
        statusCode: 404,
        code: "BATCH_NOT_OPEN"
      });
    }

    if (result.status === "batch_full") {
      throw new AppError("Kuota batch sudah habis.", {
        statusCode: 409,
        code: "BATCH_FULL"
      });
    }

    return {
      enrollment: result.enrollment,
      invoice: result.invoice,
      quota: result.quota
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      hasUniqueConstraintTarget(error.meta?.target, ["batchId", "userId"])
    ) {
      throw new AppError("Peserta sudah terdaftar pada batch ini.", {
        statusCode: 409,
        code: "DUPLICATE_ENROLLMENT"
      });
    }

    throw error;
  }
}

export async function getAdminEnrollments() {
  await syncBatchStatuses();
  const enrollments = await listEnrollmentsAdmin();

  return enrollments.map(mapEnrollment);
}

export async function getParticipantEnrollments(userId: string) {
  await syncBatchStatuses();
  const enrollments = await listEnrollmentsByUser(userId);
  return enrollments.map(mapParticipantEnrollment);
}

export async function getEnrollmentDetail(enrollmentId: string) {
  const enrollment = await findEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new AppError("Enrollment tidak ditemukan.", {
      statusCode: 404,
      code: "ENROLLMENT_NOT_FOUND"
    });
  }

  return {
    id: enrollment.id,
    assessmentStatus: enrollment.assessmentStatus,
    certificateNum: enrollment.certificateNum,
    expiryDate: enrollment.expiryDate?.toISOString() ?? null,
    qrVerifyCode: enrollment.qrVerifyCode,
    registrationDocs: enrollment.registrationDocs,
    createdAt: enrollment.createdAt.toISOString(),
    user: {
      id: enrollment.user.id,
      fullName: enrollment.user.fullName,
      email: enrollment.user.email,
    },
    batch: {
      id: enrollment.batch.id,
      status: enrollment.batch.status,
      startDate: enrollment.batch.startDate.toISOString(),
      endDate: enrollment.batch.endDate.toISOString(),
      instructor: enrollment.batch.instructor,
      assessor: enrollment.batch.assessor,
      program: {
        title: enrollment.batch.program.title,
      }
    },
    k3LogCount: enrollment._count.k3Logs,
    k3Logs: enrollment.k3Logs.map((log) => ({
      id: log.id,
      activityName: log.activityName,
      safetyScore: log.safetyScore,
      evidenceUrl: log.evidenceUrl,
      gpsWatermark: log.gpsWatermark,
      timestamp: log.timestamp.toISOString(),
      verifiedBy: log.verifiedBy ? {
        id: log.verifiedBy.id,
        fullName: log.verifiedBy.fullName
      } : null
    }))
  };
}

export async function updateEnrollmentAssessmentRecord(
  enrollmentId: string,
  payload: unknown
) {
  const parsed = enrollmentAssessmentUpdateSchema.parse(payload);
  const enrollment = await findEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new AppError("Enrollment tidak ditemukan.", {
      statusCode: 404,
      code: "ENROLLMENT_NOT_FOUND"
    });
  }

  await ensureVerifierUser(parsed.verifiedById);

  const certificateNum =
    parsed.assessmentStatus === AssessmentStatus.KOMPETEN
      ? parsed.certificateNum ?? enrollment.certificateNum ?? buildCertificateNumber(enrollment.id)
      : null;

  let finalExpiryDate = parsed.expiryDate ?? enrollment.expiryDate ?? null;

  if (parsed.assessmentStatus === AssessmentStatus.KOMPETEN && !parsed.expiryDate && !enrollment.expiryDate) {
    const config = await fetchCertificateConfig(enrollment.batch.program.id);
    if (config?.validityMonths) {
      const date = new Date();
      date.setMonth(date.getMonth() + config.validityMonths);
      finalExpiryDate = date;
    }
  }

  const expiryDate =
    parsed.assessmentStatus === AssessmentStatus.KOMPETEN
      ? finalExpiryDate
      : null;

  await updateEnrollmentAssessment(enrollmentId, {
    assessmentStatus: parsed.assessmentStatus,
    certificateNum,
    expiryDate
  });

  return getEnrollmentDetail(enrollmentId);
}

export async function getCertificateVerification(code: string) {
  const enrollment = await findEnrollmentByVerificationCode(code);

  if (!enrollment) {
    throw new AppError("Kode verifikasi sertifikat tidak ditemukan.", {
      statusCode: 404,
      code: "CERTIFICATE_NOT_FOUND"
    });
  }

  return {
    enrollmentId: enrollment.id,
    qrVerifyCode: enrollment.qrVerifyCode,
    assessmentStatus: enrollment.assessmentStatus,
    certificateNum: enrollment.certificateNum,
    expiryDate: enrollment.expiryDate?.toISOString() ?? null,
    participant: {
      id: enrollment.user.id,
      fullName: enrollment.user.fullName,
      email: enrollment.user.email,
    },
    program: {
      title: enrollment.batch.program.title,
      category: enrollment.batch.program.category,
      industryType: enrollment.batch.program.industryType,
    },
    batch: {
      id: enrollment.batch.id,
      startDate: enrollment.batch.startDate.toISOString(),
      endDate: enrollment.batch.endDate.toISOString(),
      status: enrollment.batch.status
    },
    k3LogCount: enrollment._count.k3Logs,
    issued: enrollment.assessmentStatus === AssessmentStatus.KOMPETEN
  };
}

export async function deleteEnrollmentRecord(enrollmentId: string) {
  const enrollment = await findEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new AppError("Enrollment tidak ditemukan.", {
      statusCode: 404,
      code: "ENROLLMENT_NOT_FOUND"
    });
  }

  await deleteEnrollment(enrollmentId);
}
