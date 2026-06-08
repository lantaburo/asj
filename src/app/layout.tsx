import type { Metadata } from "next";

import "@/app/britsafe-theme.css";
import { env } from "@/lib/env";
import { WAFloatingButton } from "@/features/landing-page/wa-floating-button";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: `${env.NEXT_PUBLIC_APP_NAME} | Lembaga Pelatihan & Sertifikasi K3`,
  description:
    "Lembaga pelatihan dan sertifikasi K3 resmi Kemnaker RI. Arkama Jaya Sertifikasi membantu meningkatkan kompetensi keselamatan kerja Anda secara profesional.",
  keywords: [
    "Pelatihan K3",
    "Sertifikasi K3",
    "K3 Kemnaker",
    "Ahli K3 Umum",
    "Arkama Jaya Sertifikasi",
    "AJS",
    "Keselamatan Kerja"
  ],
  authors: [{ name: "Arkama Jaya Sertifikasi" }],
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <WAFloatingButton />
      </body>
    </html>
  );
}
