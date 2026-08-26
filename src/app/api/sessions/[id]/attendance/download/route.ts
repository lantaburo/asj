import { requireAuthenticatedSessionUser } from "@/features/auth/auth.service";
import { handleApiError } from "@/lib/handle-api-error";
import { AppError } from "@/lib/app-error";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();
    
    if (currentUser.role !== "ADMIN" && currentUser.role !== "INSTRUCTOR") {
      throw new AppError("Akses ditolak.", { statusCode: 403 });
    }

    const { id } = await params;
    const session = await prisma.classSession.findUnique({
      where: { id },
      include: {
        batch: {
          include: { program: true }
        },
        attendances: {
          include: {
            user: true
          },
          orderBy: {
            checkInTime: 'asc'
          }
        }
      }
    });

    if (!session) {
      throw new AppError("Sesi tidak ditemukan.", { statusCode: 404 });
    }

    const headers = [
      "No",
      "Nama Peserta",
      "Email",
      "Waktu Presensi",
      "Status",
      "Link Foto (Selfie)"
    ];

    const rows = session.attendances.map((att, idx) => {
      const timeStr = new Date(att.checkInTime).toLocaleString("id-ID");
      // Add base url if selfieUrl is relative
      const hostUrl = request.headers.get("host") || "localhost:3000";
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      const baseUrl = `${protocol}://${hostUrl}`;
      const fullSelfieUrl = att.selfieUrl ? (att.selfieUrl.startsWith('http') ? att.selfieUrl : `${baseUrl}${att.selfieUrl}`) : "-";
      
      return [
        idx + 1,
        `"${att.user.fullName}"`,
        `"${att.user.email}"`,
        `"${timeStr}"`,
        `"${att.status}"`,
        `"${fullSelfieUrl}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const safeTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `presensi_${safeTitle}_${session.id.slice(-4)}.csv`;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
