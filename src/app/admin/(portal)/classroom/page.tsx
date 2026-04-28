import { redirect } from "next/navigation";
import { canManageMasterData, getCurrentSessionUser } from "@/features/auth/auth.service";
import { getClassroomList } from "@/features/classrooms/classroom.service";
import { ClassroomAdminPanel } from "@/features/classrooms/classroom-admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminClassroomPage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/masuk?next=/admin/classroom");
  }

  if (!canManageMasterData(currentUser.role)) {
    redirect("/admin");
  }

  const classrooms = await getClassroomList();
  
  const availableCount = classrooms.filter((c) => c.isAvailable).length;
  const totalCapacity = classrooms.reduce((total, c) => total + c.capacity, 0);

  return (
    <div style={{ display: "grid", gap: "40px" }}>
      <section
        className="britsafe-card"
        style={{ padding: "40px", borderTop: "4px solid var(--ajs-teal)" }}
      >
        <span className="britsafe-card__category">Master Data Classroom</span>
        <h1
          className="britsafe-card__title"
          style={{ fontSize: "28px", marginTop: "16px", marginBottom: "16px" }}
        >
          Daftar Ruang Kelas (Classroom)
        </h1>
        <p
          className="britsafe-card__copy"
          style={{ maxWidth: "860px", fontSize: "16px" }}
        >
          Kelola ruangan pelatihan beserta standar Keselamatan dan Kesehatan Kerja (K3) 
          yang sesuai dengan standar internasional (ISO 29993 / OSHA).
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px"
        }}
      >
        <article className="britsafe-card" style={{ padding: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--ajs-muted)",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}
          >
            Total Ruangan
          </div>
          <strong style={{ fontSize: "32px", color: "var(--ajs-teal)" }}>
            {classrooms.length}
          </strong>
        </article>
        <article className="britsafe-card" style={{ padding: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--ajs-muted)",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}
          >
            Ruangan Tersedia
          </div>
          <strong style={{ fontSize: "32px", color: "var(--ajs-teal)" }}>
            {availableCount}
          </strong>
        </article>
        <article className="britsafe-card" style={{ padding: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--ajs-muted)",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}
          >
            Total Kapasitas Kursi
          </div>
          <strong style={{ fontSize: "32px", color: "var(--ajs-teal)" }}>
            {totalCapacity}
          </strong>
        </article>
      </section>

      <ClassroomAdminPanel
        classrooms={classrooms.map((c) => ({
          id: c.id,
          roomName: c.roomName,
          capacity: c.capacity,
          facilities: Array.isArray(c.facilities) ? c.facilities.map(String) : [],
          isAvailable: c.isAvailable,
          sessionCount: c.sessionCount
        }))}
      />
    </div>
  );
}
