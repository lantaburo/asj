import { AttendanceStatus } from "@prisma/client";
import { z } from "zod";

export const attendanceScanSchema = z.object({
  sessionId: z.string().uuid(),
  gpsCoordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  selfieUrl: z.string().url().optional(),
  deviceInfo: z.string().max(255).optional(),
  status: z.nativeEnum(AttendanceStatus).optional()
}).strict();

export type AttendanceScanInput = z.infer<typeof attendanceScanSchema>;
