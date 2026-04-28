"use server";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";

export async function getInvoicesAdmin() {
  return prisma.invoice.findMany({
    orderBy: { issuedAt: 'desc' },
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
      },
      verifiedBy: true
    }
  });
}

export async function verifyInvoicePayment(invoiceId: string, adminId: string, isRejected: boolean = false) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  
  if (!invoice) {
    throw new AppError("Tagihan tidak ditemukan", { statusCode: 404 });
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: isRejected ? 'REJECTED' : 'PAID',
      verifiedById: adminId,
      paidAt: isRejected ? null : new Date(),
    }
  });
}
