import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  Shield,
  Key,
  GitFork,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Layers,
} from "lucide-react";

export default async function StaffDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    requireRole(user, [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  } catch {
    redirect("/dashboard");
  }

  // Fetch operational counts
  let pendingClaimsCount = 0;
  let readyHandoverCount = 0;
  let suggestedClustersCount = 0;
  let recentItems: any[] = [];
  let highConfidenceMatches: any[] = [];

  try {
    const results = await Promise.all([
      prisma.claim.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW", "VERIFICATION_REQUIRED"] } } }),
      prisma.claim.count({ where: { status: "HANDOVER_SCHEDULED" } }),
      prisma.duplicateCluster.count({ where: { status: "SUGGESTED" } }),
      prisma.item.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          primaryLocation: true,
          images: true,
          reporter: { select: { name: true, role: true } },
        },
      }),
      prisma.match.findMany({
        where: { overallScore: { gte: 0.85 } },
        take: 4,
        orderBy: { overallScore: "desc" },
        include: {
          lostItem: { include: { primaryLocation: true } },
          foundItem: { include: { primaryLocation: true } },
          evidence: true,
        },
      }),
    ]);
    pendingClaimsCount = results[0];
    readyHandoverCount = results[1];
    suggestedClustersCount = results[2];
    recentItems = results[3];
    highConfidenceMatches = results[4];
  } catch (err) {
    console.warn("[UniTrace Staff Dashboard] Operational counts fallback:", err);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Control Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [CONTROL-ROOM // CAMPUS-SECURITY]
            </span>
            <span className="badge-verified text-[10px]">
              DEPOT STATION 01 ACTIVE
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Staff Operations Hub
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Active Officer: <strong className="text-[#171717]">{user.name}</strong> ({user.role} • Central Security Depot) • Live Intake &amp; Release Console
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/staff/handover" className="btn-primary text-xs flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            <span>Open Handover Desk</span>
          </Link>
          <Link href="/report/found" className="btn-secondary text-xs flex items-center gap-1.5">
            <span>Log Found Property</span>
          </Link>
        </div>
      </div>

      {/* High-Density Operational Telemetry Matrix */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link
          href="/staff/claims"
          className="card p-5 space-y-2 border-[#DADAD6] bg-white hover:border-[#171717] transition rounded"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              PENDING CLAIMS
            </span>
            <Shield className="h-4 w-4 text-[#3867E8]" />
          </div>
          <div className="font-mono text-3xl font-bold text-[#171717]">{pendingClaimsCount}</div>
          <div className="text-[11px] text-[#3867E8] font-medium flex items-center gap-1">
            <span>Review Verification Queue</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        <Link
          href="/staff/handover"
          className="card p-5 space-y-2 border-[#25845A]/30 bg-[#25845A]/5 hover:border-[#25845A] transition rounded"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#25845A]">
              READY FOR HANDOVER
            </span>
            <Key className="h-4 w-4 text-[#25845A]" />
          </div>
          <div className="font-mono text-3xl font-bold text-[#25845A]">{readyHandoverCount}</div>
          <div className="text-[11px] text-[#25845A] font-medium flex items-center gap-1">
            <span>PIN Authorized Desk</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        <Link
          href="/staff/clusters"
          className="card p-5 space-y-2 border-[#DADAD6] bg-white hover:border-[#171717] transition rounded"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              DUPLICATE CLUSTERS
            </span>
            <GitFork className="h-4 w-4 text-[#171717]" />
          </div>
          <div className="font-mono text-3xl font-bold text-[#171717]">{suggestedClustersCount}</div>
          <div className="text-[11px] text-[#777777] font-medium flex items-center gap-1">
            <span>Graph Deduplication</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        <div className="card p-5 space-y-2 border-[#DADAD6] bg-white rounded">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              AI HIGH-MATCHES
            </span>
            <Sparkles className="h-4 w-4 text-[#3867E8]" />
          </div>
          <div className="font-mono text-3xl font-bold text-[#171717]">{highConfidenceMatches.length}</div>
          <div className="font-mono text-[10px] text-[#777777]">
            CONFIDENCE &ge; 85% MULTI-SIGNAL
          </div>
        </div>
      </div>

      {/* Top High-Confidence AI Matches Needing Staff Attention */}
      {highConfidenceMatches.length > 0 && (
        <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white rounded">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
                  [CORRELATION // HIGH-PRIORITY]
                </span>
                <span className="badge-signal text-[10px]">
                  ACTION REQUIRED
                </span>
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-[#171717] mt-0.5">
                Multi-Signal AI Matches Awaiting Staff Validation
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highConfidenceMatches.map((m) => (
              <div
                key={m.id}
                className="rounded border border-[#DADAD6] bg-[#F7F7F5] p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge-verified font-mono text-[11px]">
                      {Math.round(m.overallScore * 100)}% CONFIDENCE
                    </span>
                    <span className="font-mono text-[10px] text-[#777777]">
                      MATCH #{m.id.slice(-8)}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-[#DC2626] uppercase font-bold shrink-0">
                        LOST:
                      </span>
                      <span className="font-medium text-[#171717] truncate">
                        {m.lostItem.title} ({m.lostItem.primaryLocation.building})
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-[#25845A] uppercase font-bold shrink-0">
                        FOUND:
                      </span>
                      <span className="font-medium text-[#171717] truncate">
                        {m.foundItem.title} ({m.foundItem.primaryLocation.building})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DADAD6] flex items-center justify-end">
                  <Link
                    href={`/match/${m.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#171717] hover:text-[#3867E8] transition"
                  >
                    <span>Inspect Forensic Comparison</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Campus Intake Table */}
      <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white rounded">
        <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [INTAKE-FEED // LIVE-STREAM]
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-[#171717] mt-0.5">
              Recent Campus Intake Submissions
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs font-mono font-medium text-[#171717] hover:text-[#3867E8] transition flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171717]">
            <thead>
              <tr className="border-b border-[#DADAD6] text-[10px] font-mono uppercase text-[#777777]">
                <th className="pb-2.5 font-medium">TYPE</th>
                <th className="pb-2.5 font-medium">ITEM DESIGNATION</th>
                <th className="pb-2.5 font-medium">FACILITY / LOCATION</th>
                <th className="pb-2.5 font-medium">REPORTER</th>
                <th className="pb-2.5 font-medium">DATE</th>
                <th className="pb-2.5 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADAD6]/60">
              {recentItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="py-3">
                    <span
                      className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        item.type === "LOST"
                          ? "bg-[#DC2626]/5 text-[#DC2626] border-[#DC2626]/20"
                          : "bg-[#25845A]/5 text-[#25845A] border-[#25845A]/20"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 font-medium max-w-xs truncate pr-4">
                    {item.title}
                  </td>
                  <td className="py-3 text-[#777777]">
                    {item.primaryLocation.name}
                  </td>
                  <td className="py-3 text-[#777777]">
                    {item.reporter.name}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-[#777777]">
                    {new Date(item.incidentDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/journey/${item.id}`}
                      className="border border-[#DADAD6] bg-white px-2.5 py-1 text-[11px] font-mono font-medium text-[#171717] hover:border-[#171717] transition rounded"
                    >
                      Timeline
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
