import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { getCertificateVerification } from "@/features/enrollments/enrollment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    qrCode: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { qrCode } = await params;
    const certificate = await getCertificateVerification(qrCode);

    return successResponse(
      {
        certificate
      },
      {
        message: "Data verifikasi sertifikat berhasil diambil."
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
