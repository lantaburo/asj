"use server";

import { prisma } from "@/lib/prisma";

export async function getPaymentSettings() {
  return prisma.paymentSetting.findMany({
    orderBy: { createdAt: 'asc' }
  });
}

export async function createPaymentSetting(data: {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
}) {
  return prisma.paymentSetting.create({
    data: {
      ...data,
      isActive: true,
    }
  });
}

export async function updatePaymentSetting(id: string, data: {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
  isActive: boolean;
}) {
  return prisma.paymentSetting.update({
    where: { id },
    data
  });
}

export async function deletePaymentSetting(id: string) {
  return prisma.paymentSetting.delete({
    where: { id }
  });
}
