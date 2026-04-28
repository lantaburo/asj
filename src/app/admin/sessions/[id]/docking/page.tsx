import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/features/auth/auth.service";
import { getSessionDetail } from "@/features/sessions/session.service";
import { QRCodeSVG } from "qrcode.react";

export const dynamic = "force-dynamic";

export default async function SessionDockingPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect(`/masuk?next=/admin/sessions/${id}/docking`);
  }

  // Allow admin and instructor to view this
  if (currentUser.role === "TRAINEE") {
    redirect("/");
  }

  const session = await getSessionDetail(id);
  
  if (!session) {
    redirect("/admin/buat-program");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const attendanceUrl = `${baseUrl}/absen?sessionId=${session.id}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--ajs-navy)',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '720px',
        width: '100%',
        margin: 'auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ 
            fontSize: '13px', 
            fontWeight: 'bold', 
            letterSpacing: '2px', 
            textTransform: 'uppercase', 
            color: 'var(--ajs-orange)',
            display: 'block',
            marginBottom: '8px'
          }}>
            Scan untuk Presensi Kehadiran
          </span>
          <h1 style={{ 
            fontSize: '32px', 
            color: 'var(--ajs-navy)', 
            margin: '0 0 4px 0',
            fontWeight: 800 
          }}>
            {session.title}
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: 'var(--ajs-muted)', 
            margin: 0 
          }}>
            Program: {session.batch.program.title}
          </p>
        </div>

        <div style={{
          background: 'var(--ajs-gray)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '24px'
        }}>
          <QRCodeSVG 
            value={attendanceUrl} 
            size={300}
            level="H"
            includeMargin={true}
            bgColor="#FFFFFF"
            fgColor="#003366" // ajs-navy
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          width: '100%',
          borderTop: '1px solid var(--ajs-border)',
          paddingTop: '24px'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--ajs-muted)', marginBottom: '2px' }}>Ruang Kelas</div>
            <div style={{ fontSize: '18px', color: 'var(--ajs-navy)', fontWeight: 600 }}>
              {session.classroom?.roomName || "Menunggu Ruangan"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--ajs-muted)', marginBottom: '2px' }}>Instruktur</div>
            <div style={{ fontSize: '18px', color: 'var(--ajs-navy)', fontWeight: 600 }}>
              {session.instructor?.fullName || "TBA"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--ajs-muted)', marginBottom: '2px' }}>Tanggal</div>
            <div style={{ fontSize: '18px', color: 'var(--ajs-navy)', fontWeight: 600 }}>
              {new Date(session.sessionDate).toLocaleDateString("id-ID", {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--ajs-muted)', marginBottom: '2px' }}>Waktu</div>
            <div style={{ fontSize: '18px', color: 'var(--ajs-navy)', fontWeight: 600 }}>
              {new Date(session.startTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(session.endTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
      
      <p style={{ marginTop: '20px', opacity: 0.7, fontSize: '13px' }}>
        Pastikan GPS perangkat aktif saat melakukan scan. Link ini terenkripsi khusus untuk sesi ini.
      </p>
    </div>
  );
}
