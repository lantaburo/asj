"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavProps = {
  canOpenMasterData: boolean;
  canOpenLandingSettings?: boolean;
};

const baseLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Ringkasan prioritas dan akses cepat."
  },
  {
    href: "/admin/sertifikasi",
    label: "Sertifikasi",
    description: "Assessment, logbook, dan verifikasi."
  }
] as const;

const masterDataLink = {
  href: "/admin/master-data",
  label: "Master Data",
  description: "Pusat data instruktur, program, dan kelas."
} as const;

const buatProgramLink = {
  href: "/admin/buat-program",
  label: "Buat Program",
  description: "Wizard pembuatan pelatihan baru."
} as const;

const unitSkemaLink = {
  href: "/admin/unit-skema",
  label: "Unit Skema",
  description: "Skema kompetensi dan unit asesmen."
} as const;

const landingSettingsLink = {
  href: "/admin/pengaturan-landing",
  label: "Pengaturan Web",
  description: "Ubah konten landing page publik."
} as const;

const pengaturanSertifikatLink = {
  href: "/admin/pengaturan-sertifikat",
  label: "Pengaturan Sertifikat",
  description: "Template PDF dan Passing Grade."
} as const;

const pengaturanPembayaranLink = {
  href: "/admin/pengaturan-pembayaran",
  label: "Pengaturan Pembayaran",
  description: "Nomor rekening dan metode bayar."
} as const;

const verifikasiPembayaranLink = {
  href: "/admin/verifikasi-pembayaran",
  label: "Verifikasi Pembayaran",
  description: "Cek dan setujui bukti transfer."
} as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ canOpenMasterData, canOpenLandingSettings }: AdminNavProps) {
  const pathname = usePathname();
  type NavLink = { href: string; label: string; description: string };
  let links: NavLink[] = [...baseLinks];

  if (canOpenMasterData) {
    links = [baseLinks[0], masterDataLink, unitSkemaLink, buatProgramLink, baseLinks[1], verifikasiPembayaranLink, pengaturanSertifikatLink, pengaturanPembayaranLink];
  }

  if (canOpenLandingSettings) {
    links.push(landingSettingsLink);
  }

  return (
    <nav className="admin-nav admin-nav--rail" aria-label="Navigasi admin">
      {links.map((link) => {
        const isActive = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            className={`nav-chip${isActive ? " nav-chip--active" : ""}`}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-chip-label">{link.label}</span>
            <span className="nav-chip-copy">{link.description}</span>
          </Link>
        );
      })}
    </nav>
  );
}
