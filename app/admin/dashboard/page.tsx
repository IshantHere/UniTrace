import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  Layers,
  MapPin,
  Tag,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Compass,
  FileText,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    requireRole(user, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  } catch {
    redirect("/dashboard");
  }

  // Fetch campus intelligence metrics
  const [
    totalLost,
    totalFound,
    recoveredCount,
    activeMatches,
    duplicateClusters,
    locations,
    categories,
    recentAudits,
  ] = await Promise.all([
    prisma.item.count({ where: { type: "LOST" } }),
    prisma.item.count({ where: { type: "FOUND" } }),
    prisma.item.count({ where: { status: "RECOVERED" } }),
    prisma.match.count({ where: { overallScore: { gte: 0.8 } } }),
    prisma.duplicateCluster.count(),
    prisma.location.findMany({
      include: { _count: { select: { items: true, sightings: true } } },
      orderBy: { items: { _count: "desc" } },
    }),
    prisma.category.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { items: { _count: "desc" } },
    }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, role: true } } },
    }),
  ]);

  const totalReports = totalLost + totalFound;
  const recoveryRate = totalLost > 0 ? Math.round((recoveredCount / totalLost) * 100) : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Campus Administration
            </span>
            <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
              Institutional Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Executive Intelligence Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Apex University Campus Safety &amp; Asset Recovery Metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/locations" className="btn-secondary text-xs">
            <MapPin className="h-3.5 w-3.5" /> Locations
          </Link>
          <Link href="/admin/categories" className="btn-secondary text-xs">
            <Tag className="h-3.5 w-3.5" /> Categories
          </Link>
          <Link href="/admin/users" className="btn-secondary text-xs">
            <Users className="h-3.5 w-3.5" /> Users
          </Link>
          <Link href="/admin/audit" className="btn-secondary text-xs">
            <FileText className="h-3.5 w-3.5" /> Audit Logs
          </Link>
        </div>
      </div>

      {/* Core Executive KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-5 space-y-2 border-emerald-200 bg-emerald-50/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Property Recovery Rate
          </span>
          <div className="text-3xl font-black text-emerald-700">{recoveryRate}%</div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {recoveredCount} of {totalLost} lost items recovered
          </div>
        </div>

        <div className="card p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Intake Volume
          </span>
          <div className="text-3xl font-black text-slate-900">{totalReports}</div>
          <div className="text-[11px] text-slate-500">
            {totalLost} Lost • {totalFound} Found
          </div>
        </div>

        <div className="card p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            AI High-Matches
          </span>
          <div className="text-3xl font-black text-brand-600">{activeMatches}</div>
          <div className="text-[11px] text-slate-500">Score &ge; 80% Multi-Signal</div>
        </div>

        <div className="card p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Deduplicated Clusters
          </span>
          <div className="text-3xl font-black text-purple-600">{duplicateClusters}</div>
          <div className="text-[11px] text-slate-500">Graph detected clusters</div>
        </div>
      </div>

      {/* Analytics Breakdown Grid: Location Hotspots & Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campus Location Hotspots */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Campus Location Hotspots</h2>
            </div>
            <Link href="/admin/locations" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Manage Map Pins
            </Link>
          </div>

          <div className="space-y-3">
            {locations.slice(0, 5).map((loc) => (
              <div key={loc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{loc.name}</div>
                  <div className="text-slate-500">{loc.building} • Floor {loc.floor || "G"}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-700 text-sm">{loc._count.items}</span>
                  <span className="text-slate-400 block text-[10px]">items reported</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Distribution */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Category Distribution &amp; High-Value</h2>
            </div>
            <Link href="/admin/categories" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Edit Categories
            </Link>
          </div>

          <div className="space-y-3">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-slate-900">{cat.name}</div>
                  {cat.isHighValue && (
                    <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2">
                      High-Value Protocol
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-700 text-sm">{cat._count.items}</span>
                  <span className="text-slate-400 block text-[10px]">items</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Compliance & Audit Activity Stream */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Compliance &amp; Operational Audit Log</h2>
          </div>
          <Link href="/admin/audit" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View Complete Audit Trail <ArrowRight className="h-3 w-3 inline" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {recentAudits.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                  {a.action}
                </span>
                <span className="text-slate-700 font-medium">
                  {a.actor?.name || "System Automated"} ({a.actor?.role || "SYSTEM"}) on {a.entityType} #{a.entityId.slice(-8)}
                </span>
              </div>
              <span className="text-slate-400 whitespace-nowrap">
                {new Date(a.createdAt).toLocaleDateString()} {new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
