import { LandingPageClient } from "@/features/landing-page/landing-page-client";
import { getPublicPrograms, getComingSoonPrograms } from "@/features/programs/program.service";
import { getTotalParticipantCount } from "@/features/landing-page/landing-page.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [programs, totalParticipants, comingSoonPrograms] = await Promise.all([
    getPublicPrograms(),
    getTotalParticipantCount(),
    getComingSoonPrograms()
  ]);

  return (
    <LandingPageClient
      programs={programs}
      totalParticipants={totalParticipants}
      comingSoonPrograms={comingSoonPrograms}
    />
  );
}
