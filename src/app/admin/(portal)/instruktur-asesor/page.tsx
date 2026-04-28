import { redirect } from "next/navigation";
import {
  canManageMasterData,
  getCurrentSessionUser
} from "@/features/auth/auth.service";
import { getInternalMemberList } from "@/features/users/internal-member.service";
import { InstructorAssessorPanel } from "@/features/users/instructor-assessor-panel";

export const dynamic = "force-dynamic";

export default async function AdminInstructorAssessorPage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/masuk?next=/admin/instruktur-asesor");
  }

  if (!canManageMasterData(currentUser.role)) {
    redirect("/admin");
  }

  const members = await getInternalMemberList();

  return (
    <div style={{ display: "grid", gap: "40px" }}>
      <section>
        <h1 style={{ fontSize: "28px", color: "var(--ajs-navy)", margin: "0 0 8px 0" }}>
          Instruktur & Asesor
        </h1>
        <p style={{ fontSize: "15px", color: "var(--ajs-muted)", margin: 0, maxWidth: "800px" }}>
          Kelola daftar tenaga pengajar, asesor, serta role operasional lain. 
          Member dengan role INSTRUCTOR wajib memiliki spesifikasi level. 
          Semua entitas ini terhubung langsung pada jadwal batch dan session.
        </p>
      </section>

      <InstructorAssessorPanel members={members} />
    </div>
  );
}
