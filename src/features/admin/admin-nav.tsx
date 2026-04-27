"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavProps = {
  canOpenMasterData: boolean;
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
  description: "Program, batch, classroom, dan session."
} as const;

const unitSkemaLink = {
  href: "/admin/unit-skema",
  label: "Unit Skema",
  description: "Skema kompetensi dan unit asesmen."
} as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ canOpenMasterData }: AdminNavProps) {
  const pathname = usePathname();
  const links = canOpenMasterData
    ? [baseLinks[0], masterDataLink, unitSkemaLink, baseLinks[1]]
    : baseLinks;

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
