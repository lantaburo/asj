import { LandingPageClient } from "@/features/landing-page/landing-page-client";
import { getPublicPrograms } from "@/features/programs/program.service";
import { getTotalParticipantCount } from "@/features/landing-page/landing-page.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [programs, totalParticipants] = await Promise.all([
    getPublicPrograms(),
    getTotalParticipantCount()
  ]);

  return (
    <LandingPageClient 
      programs={programs} 
      totalParticipants={totalParticipants} 
    />
  );
}
