import { prisma } from "@/lib/prisma";
import { Role, AssessmentStatus } from "@prisma/client";

export async function getSuperAdminOverview() {
  const [
    programCount,
    batchCount,
    participantCount,
    graduatedCount,
    competentCount,
    notCompetentCount,
    instructorCount,
    assessorCount,
    sessions,
    enrollmentsWithBatch
  ] = await Promise.all([
    prisma.program.count(),
    prisma.batch.count(),
    prisma.user.count({ where: { role: Role.TRAINEE } }),
    prisma.enrollment.count({ where: { certificateNum: { not: null } } }),
    prisma.enrollment.count({ where: { assessmentStatus: AssessmentStatus.KOMPETEN } }),
    prisma.enrollment.count({ where: { assessmentStatus: AssessmentStatus.BELUM_KOMPETEN } }),
    prisma.user.count({ where: { role: Role.INSTRUCTOR } }),
    prisma.user.count({ where: { role: Role.ASSESSOR } }),
    prisma.classSession.findMany({ select: { startTime: true, endTime: true } }),
    prisma.enrollment.findMany({
      include: {
        batch: {
          include: {
            program: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  // Calculate Revenue and Pareto
  let totalRevenue = 0;
  const programRevenueMap = new Map<string, { title: string; revenue: number; batchCount: number }>();
  const batchRevenueMap = new Map<string, { title: string; revenue: number }>();
  
  // Time series data
  const monthlyDataMap = new Map<string, { month: string; revenue: number; participants: number; batches: Set<string> }>();

  for (const enrollment of enrollmentsWithBatch) {
    const price = enrollment.batch.price ?? 0;
    totalRevenue += price;

    // Monthly aggregation
    const date = new Date(enrollment.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthName = date.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    
    const mData = monthlyDataMap.get(monthKey) ?? { month: monthName, revenue: 0, participants: 0, batches: new Set<string>() };
    mData.revenue += price;
    mData.participants += 1;
    mData.batches.add(enrollment.batchId);
    monthlyDataMap.set(monthKey, mData);

    // Program Pareto
    const progId = enrollment.batch.program.id;
    const progData = programRevenueMap.get(progId) ?? { 
      title: enrollment.batch.program.title, 
      revenue: 0,
      batchCount: 0 
    };
    progData.revenue += price;
    programRevenueMap.set(progId, progData);

    // Batch Pareto
    const batchId = enrollment.batch.id;
    const batchData = batchRevenueMap.get(batchId) ?? { 
      title: enrollment.batch.title ? enrollment.batch.title : `${enrollment.batch.program.title} - Batch ${batchId.slice(0, 4)}`, 
      revenue: 0 
    };
    batchData.revenue += price;
    batchRevenueMap.set(batchId, batchData);
  }

  // Convert monthly map to sorted array
  const timeSeries = Array.from(monthlyDataMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([_, data]) => ({
      month: data.month,
      revenue: data.revenue,
      participants: data.participants,
      batchCount: data.batches.size
    }));

  // Sort for Pareto
  const topPrograms = Array.from(programRevenueMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topBatches = Array.from(batchRevenueMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    metrics: {
      revenue: totalRevenue,
      programs: programCount,
      batches: batchCount,
      participants: participantCount,
      graduated: graduatedCount,
      competent: competentCount,
      notCompetent: notCompetentCount,
      instructors: instructorCount,
      assessors: assessorCount,
      totalJP: sessions.reduce((acc, s) => {
        const diffMs = s.endTime.getTime() - s.startTime.getTime();
        return acc + Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      }, 0),
    },
    pareto: {
      topPrograms,
      topBatches
    },
    timeSeries
  };
}
