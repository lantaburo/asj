import path from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import PDFDocument from "pdfkit";

import { requireAuthenticatedSessionUser, canAccessAdminPortal } from "@/features/auth/auth.service";
import { handleApiError } from "@/lib/handle-api-error";
import { AppError } from "@/lib/app-error";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const WITA = "Asia/Makassar";

function fmtDate(d: Date) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: WITA
  });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: WITA });
}

async function buildPdf(session: Awaited<ReturnType<typeof getSession>>): Promise<Buffer> {
  if (!session) throw new Error("Session null");

  // Pre-load all selfie image buffers (do async work before PDF generation)
  const selfieBuffers: (Buffer | null)[] = await Promise.all(
    session.attendances.map(async (att) => {
      if (!att.selfieUrl) return null;
      const relPath = att.selfieUrl.startsWith("/") ? att.selfieUrl : `/${att.selfieUrl}`;
      const absPath = path.join(process.cwd(), "public", relPath);
      if (!existsSync(absPath)) return null;
      try {
        return await readFile(absPath);
      } catch {
        return null;
      }
    })
  );

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width - 80;

    // ── Header ──────────────────────────────────────────────────────────
    doc.fontSize(18).font("Helvetica-Bold")
      .text("DAFTAR HADIR PESERTA", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(13).font("Helvetica-Bold")
      .text(session.title, { align: "center" });
    doc.fontSize(10).font("Helvetica")
      .text(`Program: ${session.batch.program.title}`, { align: "center" });
    doc.moveDown(0.3);

    // ── Info grid ───────────────────────────────────────────────────────
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.4);

    const infoY = doc.y;
    const lineH = 16;
    const info = [
      ["Tanggal", fmtDate(session.sessionDate)],
      ["Waktu", `${fmtTime(session.startTime)} – ${fmtTime(session.endTime)} WITA`],
      ["Ruang", (session as any).classroom?.roomName ?? "—"],
      ["Instruktur", (session as any).instructor?.fullName ?? "—"],
      ["Batch", session.batch.title ?? "—"],
      ["Jumlah Hadir", `${session.attendances.length} peserta`],
    ];
    info.forEach(([label, value], i) => {
      const y = infoY + i * lineH;
      doc.fontSize(9).font("Helvetica-Bold").text(`${label}:`, 40, y);
      doc.fontSize(9).font("Helvetica").text(value, 130, y);
    });
    doc.y = infoY + info.length * lineH + 10;
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.6);

    // ── Attendees ───────────────────────────────────────────────────────
    if (session.attendances.length === 0) {
      doc.fontSize(11).text("Belum ada peserta yang hadir.", { align: "center" });
    } else {
      for (const [idx, att] of session.attendances.entries()) {
        if (doc.y > doc.page.height - 200) doc.addPage();

        const blockY = doc.y;
        const imgW = 90;
        const imgH = 110;
        const imgX = 40;
        const textX = imgX + imgW + 14;
        const textW = W - imgW - 14;

        const imgBuf = selfieBuffers[idx];
        if (imgBuf) {
          try {
            doc.image(imgBuf, imgX, blockY, { width: imgW, height: imgH, cover: [imgW, imgH] });
          } catch {
            doc.rect(imgX, blockY, imgW, imgH).fillAndStroke("#f0f0f0", "#cccccc");
            doc.fontSize(7).fillColor("#999").text("Foto gagal dimuat", imgX + 2, blockY + imgH / 2 - 6, { width: imgW - 4, align: "center" });
            doc.fillColor("black");
          }
        } else {
          doc.rect(imgX, blockY, imgW, imgH).fillAndStroke("#f5f5f5", "#cccccc");
          doc.fontSize(7).fillColor("#999").text(att.selfieUrl ? "Foto tidak tersedia" : "Tidak ada foto", imgX + 2, blockY + imgH / 2 - 6, { width: imgW - 4, align: "center" });
          doc.fillColor("black");
        }

        // Text info
        doc.fontSize(11).font("Helvetica-Bold")
          .text(`${idx + 1}. ${att.user.fullName}`, textX, blockY, { width: textW });
        doc.fontSize(9).font("Helvetica").fillColor("#555555")
          .text(att.user.email, textX, doc.y, { width: textW });
        doc.fillColor("black");
        doc.moveDown(0.4);
        doc.fontSize(9).font("Helvetica")
          .text(`Check-in: ${fmtTime(att.checkInTime)} WITA`, textX, doc.y, { width: textW });
        doc.moveDown(0.2);
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#00a651")
          .text(`Status: ${att.status === "PRESENT" ? "✓ HADIR" : att.status}`, textX, doc.y, { width: textW });
        doc.fillColor("black");

        const afterBlock = blockY + imgH + 12;
        if (doc.y < afterBlock) doc.y = afterBlock;

        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor("#eeeeee").stroke();
        doc.strokeColor("black");
        doc.moveDown(0.5);
      }
    }

    // ── Footer ──────────────────────────────────────────────────────────
    if (doc.y > doc.page.height - 80) doc.addPage();
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.4);
    doc.fontSize(8).fillColor("#aaaaaa")
      .text(`Dicetak otomatis oleh sistem AJS · ${new Date().toLocaleString("id-ID", { timeZone: WITA })} WITA`, { align: "center" });

    doc.end();
  });
}

async function getSession(sessionId: string) {
  return prisma.classSession.findUnique({
    where: { id: sessionId },
    include: {
      batch: { include: { program: true } },
      classroom: true,
      instructor: true,
      attendances: {
        include: { user: true },
        orderBy: { checkInTime: "asc" }
      }
    }
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const currentUser = await requireAuthenticatedSessionUser();
    if (!canAccessAdminPortal(currentUser.role)) {
      throw new AppError("Akses ditolak. Anda tidak memiliki izin untuk mengunduh.", { statusCode: 403 });
    }

    const { sessionId } = await params;
    const session = await getSession(sessionId);
    if (!session) throw new AppError("Sesi tidak ditemukan.", { statusCode: 404 });

    const pdfBuffer = await buildPdf(session);
    const safeTitle = session.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `presensi_${safeTitle}_${session.id.slice(-4)}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
