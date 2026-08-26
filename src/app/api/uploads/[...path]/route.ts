import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // Prevent directory traversal attacks
    if (pathSegments.some(segment => segment.includes(".."))) {
      return new NextResponse("Invalid Path", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", ...pathSegments);

    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        return new NextResponse("Not a file", { status: 400 });
      }

      const fileBuffer = await readFile(filePath);
      const mimeType = getMimeType(filePath);

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return new NextResponse("File Not Found", { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
