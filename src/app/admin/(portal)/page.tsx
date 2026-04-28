import Link from "next/link";
import {
  canManageMasterData,
  getCurrentSessionUser
} from "@/features/auth/auth.service";
import { getSuperAdminOverview } from "@/features/admin/admin.service";
import { SuperAdminDashboard } from "@/features/admin/super-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentSessionUser();
  const canOpenMasterData = currentUser
    ? canManageMasterData(currentUser.role)
    : false;

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const overviewData = isSuperAdmin ? await getSuperAdminOverview() : null;

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      {isSuperAdmin && overviewData && (
        <SuperAdminDashboard data={overviewData} />
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <Link href="/admin/master-data" className="britsafe-card" style={{ padding: '20px', textAlign: 'center', fontWeight: '700', textDecoration: 'none', color: 'var(--ajs-navy)' }}>
          Master Data
        </Link>
        <Link href="/admin/unit-skema" className="britsafe-card" style={{ padding: '20px', textAlign: 'center', fontWeight: '700', textDecoration: 'none', color: 'var(--ajs-teal)' }}>
          Unit Skema
        </Link>
        <Link href="/admin/sertifikasi" className="britsafe-card" style={{ padding: '20px', textAlign: 'center', fontWeight: '700', textDecoration: 'none', color: 'var(--ajs-orange)' }}>
          Sertifikasi
        </Link>
        <Link href="/admin/artikel" className="britsafe-card" style={{ padding: '20px', textAlign: 'center', fontWeight: '700', textDecoration: 'none', color: '#7E57C2' }}>
          Artikel AI
        </Link>
        <Link href="/admin/ai-brain" className="britsafe-card" style={{ padding: '20px', textAlign: 'center', fontWeight: '700', textDecoration: 'none', color: '#EF5350' }}>
          AI Brain
        </Link>
      </section>
    </div>
  );
}
