import type { PublicProgramDto } from "@/features/programs/program.types";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

function asSafeBatchList(program: PublicProgramDto) {
  return Array.isArray(program.openBatches) ? program.openBatches : [];
}

function asFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}


export async function getTotalParticipantCount() {
  return prisma.user.count({
    where: {
      role: Role.TRAINEE
    }
  });
}

export function countOpenBatches(programs: PublicProgramDto[]) {
  return programs.reduce((total, program) => total + asSafeBatchList(program).length, 0);
}

export function countAvailableSeats(programs: PublicProgramDto[]) {
  return programs.reduce(
    (total, program) =>
      total +
      asSafeBatchList(program).reduce(
        (batchTotal, batch) => batchTotal + asFiniteNumber(batch.quotaRemaining),
        0
      ),
    0
  );
}

export function formatCurrency(value: number | null) {
  if (value === null || typeof value !== "number" || !Number.isFinite(value)) {
    return "Hubungi Admin";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDateRange(startDate: string | Date, endDate: string | Date) {
  const startObj = typeof startDate === "string" ? new Date(startDate) : startDate;
  const endObj = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    return "Jadwal akan diumumkan";
  }

  const formatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium"
  });

  return `${formatter.format(startObj)} - ${formatter.format(endObj)}`;
}

export function compareDateStrings(leftDate: string, rightDate: string) {
  const leftTimestamp = parseTimestamp(leftDate);
  const rightTimestamp = parseTimestamp(rightDate);

  if (leftTimestamp === null && rightTimestamp === null) {
    return 0;
  }

  if (leftTimestamp === null) {
    return 1;
  }

  if (rightTimestamp === null) {
    return -1;
  }

  return leftTimestamp - rightTimestamp;
}
