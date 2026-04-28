import { NextResponse } from "next/server";
import { getCurrentSessionUser, canManageMasterData } from "@/features/auth/auth.service";
import { fetchCertificateConfig, saveCertificateConfig } from "@/features/certificate-config/certificate-config.service";
import { CertificateConfigUpdateSchema } from "@/features/certificate-config/certificate-config.schema";
import { handleApiError } from "@/lib/handle-api-error";
import { AppError } from "@/lib/app-error";

export async function GET(req: Request) {
  try {
    const user = await getCurrentSessionUser();
    if (!user || !canManageMasterData(user.role)) {
      throw new AppError("Akses ditolak.", { statusCode: 403, code: "FORBIDDEN" });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");

    const config = await fetchCertificateConfig(programId);
    return NextResponse.json({ data: config });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentSessionUser();
    if (!user || !canManageMasterData(user.role)) {
      throw new AppError("Akses ditolak.", { statusCode: 403, code: "FORBIDDEN" });
    }

    const body = await req.json();
    const parsed = CertificateConfigUpdateSchema.parse(body);

    const updated = await saveCertificateConfig(parsed);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
