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
  const [
    pendingClaimsCount,
    readyHandoverCount,
    suggestedClustersCount,
    recentItems,
    highConfidenceMatches,
  ] = await Promise.all([
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              Campus Security Operations
            </span>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              Station Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Staff Operations Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as {user.name} ({user.role}) • Central Security Depot
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/staff/handover" className="btn-primary">
            <Key className="h-4 w-4" />
            Open Handover Station
          </Link>
          <Link href="/report/found" className="btn-secondary">
            Log Found Intake
          </Link>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/staff/claims" className="card p-5 space-y-2 hover:border-brand-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Claims
            </span>
            <Shield className="h-4 w-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{pendingClaimsCount}</div>
          <div className="text-[11px] text-brand-600 font-medium flex items-center gap-1">
            Review Queue <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        <Link href="/staff/handover" className="card p-5 space-y-2 hover:border-emerald-300 bg-emerald-50/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Ready for Handover
            </span>
            <Key className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{readyHandoverCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            PIN Authorized <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        <Link href="/staff/clusters" className="card p-5 space-y-2 hover:border-purple-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Duplicate Clusters
            </span>
            <GitFork className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{suggestedClustersCount}</div>
          <div className="text-[11px] text-purple-600 font-medium flex items-center gap-1">
            Merge Reports <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        <div className="card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              AI High-Matches
            </span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{highConfidenceMatches.length}</div>
          <div className="text-[11px] text-slate-400">Score &ge; 85% Multi-Signal</div>
        </div>
      </div>

      {/* Top High-Confidence AI Matches Detected */}
      {highConfidenceMatches.length > 0 && (
        <section className="card p-6 space-y-4 border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                High-Confidence AI Matches Requiring Attention
              </h2>
              <p className="text-xs text-slate-500">
                Strong multi-signal convergence detected between lost reports and intake inventory.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highConfidenceMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-emerald-100 text-emerald-800 font-bold">
                      {Math.round(m.overallScore * 100)}% MATCH
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Match #{m.id.slice(-8)}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-bold text-rose-700">Lost:</span> {m.lostItem.title} (
                      {m.lostItem.primaryLocation.building})
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700">Found:</span> {m.foundItem.title} (
                      {m.foundItem.primaryLocation.building})
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    href={`/match/${m.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Inspect Full Evidence &amp; Verification <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Campus Intake Feed */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Campus Intake Submissions</h2>
            <p className="text-xs text-slate-500">Live stream of reports filed by students and staff</p>
          </div>
          <Link href="/search" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View All in Search
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentItems.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`badge ${
                    item.type === "LOST"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {item.type}
                </span>

                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{item.title}</div>
                  <div className="text-slate-500 flex items-center gap-2">
                    <span>{item.primaryLocation.name}</span>
                    <span>•</span>
                    <span>Reported by {item.reporter.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-slate-400">
                  {new Date(item.incidentDate).toLocaleDateString()}
                </span>
                <Link
                  href={`/journey/${item.id}`}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Timeline
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
