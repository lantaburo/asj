import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/features/auth/auth.service";
import { findSessionById } from "@/features/attendance/attendance.repository";
import { AJSLogo } from "@/features/landing-page/logo";
import Link from "next/link";
import { FotoAbsenClient } from "./foto-client";

export const dynamic = "force-dynamic";

export default async function AbsenFotoPage({
  searchParams
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;

  if (!sessionId) {
    redirect("/");
  }

  const currentUser = await getCurrentSessionUser();
  if (!currentUser) {
    redirect(`/peserta/masuk?next=${encodeURIComponent(`/absen/foto?sessionId=${sessionId}`)}`);
  }

  const session = await findSessionById(sessionId);
  if (!session) {
    redirect("/");
  }

  return (
    <div className="britsafe-site" style={{ background: "var(--ajs-gray)", minHeight: "100vh" }}>
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
        </div>
      </header>

      <main style={{ padding: "40px 20px" }}>
        <div className="container" style={{ maxWidth: "480px" }}>
          <FotoAbsenClient
            session={{
              id: session.id,
              title: session.title,
              sessionDate: session.sessionDate.toISOString(),
              programTitle: session.batch.program.title
            }}
            userName={currentUser.fullName ?? currentUser.email}
          />
        </div>
      </main>
    </div>
  );
}
