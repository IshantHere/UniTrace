import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user's reported items
  let userItems: any[] = [];
  let userClaims: any[] = [];
  let topMatches: any[] = [];

  try {
    userItems = await prisma.item.findMany({
      where: { reporterId: user.id },
      include: {
        category: true,
        primaryLocation: true,
        images: true,
        visualFingerprint: true,
        lostMatches: {
          include: {
            foundItem: {
              include: {
                images: true,
                primaryLocation: true,
              },
            },
          },
          orderBy: { overallScore: "desc" },
        },
        foundMatches: {
          include: {
            lostItem: {
              include: {
                images: true,
                primaryLocation: true,
              },
            },
          },
          orderBy: { overallScore: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    userClaims = await prisma.claim.findMany({
      where: { claimantId: user.id },
      include: {
        item: {
          include: {
            images: true,
            primaryLocation: true,
          },
        },
        handoverRecord: {
          include: {
            handoverLocation: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    topMatches = await prisma.match.findMany({
      where: {
        OR: [
          { lostItem: { reporterId: user.id } },
          { foundItem: { reporterId: user.id } },
        ],
        overallScore: { gte: 0.75 },
      },
      include: {
        lostItem: {
          include: {
            images: true,
            primaryLocation: true,
          },
        },
        foundItem: {
          include: {
            images: true,
            primaryLocation: true,
          },
        },
        evidence: true,
      },
      orderBy: { overallScore: "desc" },
      take: 3,
    });
  } catch (err) {
    console.warn("[UniTrace Dashboard] Telemetry query fallback:", err);
  }

  return (
    <DashboardView
      user={user}
      initialUserItems={userItems}
      initialUserClaims={userClaims}
      initialTopMatches={topMatches}
    />
  );
}
