import { z } from "zod";

export const CertificateConfigUpdateSchema = z.object({
  programId: z.string().nullable().optional(),
  pdfTemplateUrl: z.string().nullable().optional(),
  signatureUrl: z.string().nullable().optional(),
  signatoryName: z.string().nullable().optional(),
  signatoryTitle: z.string().nullable().optional(),
  passingGrade: z.number().int().min(0).max(100).optional(),
  validityMonths: z.number().int().min(0).nullable().optional(),
});

export type CertificateConfigUpdateDto = z.infer<typeof CertificateConfigUpdateSchema>;
