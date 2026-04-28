const fs = require('fs');
let code = fs.readFileSync('src/features/users/internal-member.service.ts', 'utf-8');

const importsToAdd = `
import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
`;

if (!code.includes("node:path")) {
  code = code.replace(/import \{ hashPassword \} from "@\/lib\/password";/, \`\${importsToAdd}\nimport { hashPassword } from "@/lib/password";\`);
}

// Add mapInternalMember mapping
code = code.replace(
  /licenseNumber: member.licenseNumber,/,
  `licenseNumber: member.licenseNumber,
    profilePictureUrl: member.profilePictureUrl,`
);

// Add writeProfilePictureFile and handleProfilePicture
const handlePhotoCode = `
async function handleProfilePicture(userId: string, file: unknown): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  
  const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowedMimeTypes.has(file.type)) {
    throw new AppError("Format foto harus JPG, PNG, atau WEBP.", { statusCode: 415, code: "INVALID_PHOTO_FORMAT" });
  }
  
  if (file.size > 2 * 1024 * 1024) {
    throw new AppError("Ukuran foto maksimal 2 MB.", { statusCode: 413, code: "PHOTO_TOO_LARGE" });
  }

  const safeFileName = file.name.trim().toLowerCase().replace(/[^a-z0-9.\\-_]+/g, "-").replace(/-+/g, "-") || "photo.jpg";
  const documentId = randomUUID();
  const storageKey = path.posix.join("uploads", "profile-pictures", userId, \`\${documentId}-\${safeFileName}\`);
  const absolutePath = path.join(process.cwd(), "public", storageKey);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return \`/\${storageKey}\`;
}

export async function createInternalMemberRecord(payload: unknown) {
`;

code = code.replace(/export async function createInternalMemberRecord\(payload: unknown\) \{/, handlePhotoCode);

code = code.replace(
  /licenseNumber: parsed.licenseNumber \?\? null,/,
  `licenseNumber: parsed.licenseNumber ?? null,
    profilePictureUrl: null, // Note: payload for POST is now FormData if photo is present, wait.`
);

fs.writeFileSync('src/features/users/internal-member.service.ts', code);
