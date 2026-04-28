"use server";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";

export async function getInvoiceDetails(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      enrollment: {
        include: {
          user: true,
          batch: {
            include: {
              program: true
            }
          }
        }
      }
    }
  });

  if (!invoice) {
    throw new AppError("Tagihan tidak ditemukan", { statusCode: 404 });
  }

  return invoice;
}

export async function uploadPaymentProof(invoiceId: string, proofUrl: string) {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paymentProofUrl: proofUrl,
      status: "PENDING_VERIFICATION"
    }
  });
}
