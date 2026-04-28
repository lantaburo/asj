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

    </div>
  );
}
