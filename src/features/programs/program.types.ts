import type { BatchStatus, ProgramCategory } from "@prisma/client";

export type PublicBatchDto = {
  id: string;
  startDate: string;
  endDate: string;
  quota: number;
  quotaRemaining: number;
  price: number | null;
  status: BatchStatus;
  instructorName: string | null;
};

export type PublicProgramDto = {
  id: string;
  title: string;
  category: ProgramCategory;
  customCategory: string | null;
  categoryLabel: string;
  industryType: string;
  description: string | null;
  openBatches: PublicBatchDto[];
};
