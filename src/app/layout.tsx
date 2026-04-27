import type { Metadata } from "next";

import "@/app/britsafe-theme.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `${env.NEXT_PUBLIC_APP_NAME} | Sistem Informasi Pelatihan K3`,
  description:
    "Platform AJS untuk pengelolaan pelatihan, batch, pendaftaran, dan absensi K3 yang terintegrasi dengan landing page publik."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
