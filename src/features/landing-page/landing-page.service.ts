import type { PublicProgramDto } from "@/features/programs/program.types";

export function countOpenBatches(programs: PublicProgramDto[]) {
  return programs.reduce((total, program) => total + program.openBatches.length, 0);
}

export function countAvailableSeats(programs: PublicProgramDto[]) {
  return programs.reduce(
    (total, program) =>
      total +
      program.openBatches.reduce(
        (batchTotal, batch) => batchTotal + batch.quotaRemaining,
        0
      ),
    0
  );
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "Hubungi Admin";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium"
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}
