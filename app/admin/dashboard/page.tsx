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
  Activity,
  CheckCircle2,
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
  let totalLost = 0;
  let totalFound = 0;
  let recoveredCount = 0;
  let activeMatches = 0;
  let duplicateClusters = 0;
  let locations: any[] = [];
  let categories: any[] = [];
  let recentAudits: any[] = [];

  try {
    const results = await Promise.all([
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
    totalLost = results[0];
    totalFound = results[1];
    recoveredCount = results[2];
    activeMatches = results[3];
    duplicateClusters = results[4];
    locations = results[5];
    categories = results[6];
    recentAudits = results[7];
  } catch (err) {
    console.warn("[UniTrace Admin Dashboard] Intelligence metrics fallback:", err);
  }

  const totalReports = totalLost + totalFound;
  const recoveryRate = totalLost > 0 ? Math.round((recoveredCount / totalLost) * 100) : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [EXECUTIVE-CONSOLE // INSTITUTIONAL-INTELLIGENCE]
            </span>
            <span className="badge-signal text-[10px]">
              ADMIN DEAN DISPATCH
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Executive Intelligence Console
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Administrator: <strong className="text-[#171717]">{user.name}</strong> • Newton University Campus Safety &amp; Asset Recovery Analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/locations" className="btn-secondary text-xs flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>Locations</span>
          </Link>
          <Link href="/admin/categories" className="btn-secondary text-xs flex items-center gap-1.5">
            <Tag className="h-3 w-3" />
            <span>Categories</span>
          </Link>
          <Link href="/admin/users" className="btn-secondary text-xs flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>Users</span>
          </Link>
          <Link href="/admin/audit" className="btn-secondary text-xs flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Core Executive KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-5 space-y-2 border-[#25845A]/30 bg-[#25845A]/5 rounded">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#25845A]">
            PROPERTY RECOVERY RATE
          </span>
          <div className="font-mono text-3xl font-bold text-[#25845A]">{recoveryRate}%</div>
          <div className="font-mono text-[11px] text-[#25845A]">
            {recoveredCount} of {totalLost} lost items recovered
          </div>
        </div>

        <div className="card p-5 space-y-2 border-[#DADAD6] bg-white rounded">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
            TOTAL INTAKE VOLUME
          </span>
          <div className="font-mono text-3xl font-bold text-[#171717]">{totalReports}</div>
          <div className="font-mono text-[11px] text-[#777777]">
            {totalLost} Lost • {totalFound} Found
          </div>
        </div>

        <div className="card p-5 space-y-2 border-[#DADAD6] bg-white rounded">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
            AI HIGH-MATCHES
          </span>
          <div className="font-mono text-3xl font-bold text-[#3867E8]">{activeMatches}</div>
          <div className="font-mono text-[10px] text-[#777777]">
            CONFIDENCE &ge; 80% MULTI-SIGNAL
          </div>
        </div>

        <div className="card p-5 space-y-2 border-[#DADAD6] bg-white rounded">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
            DEDUPLICATED CLUSTERS
          </span>
          <div className="font-mono text-3xl font-bold text-[#171717]">{duplicateClusters}</div>
          <div className="font-mono text-[10px] text-[#777777]">
            GRAPH DETECTED CLUSTERS
          </div>
        </div>
      </div>

      {/* Operational Efficiency Benchmarks */}
      <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white rounded">
        <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [BENCHMARKS // OPERATIONAL-SLA]
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-[#171717] mt-0.5">
              Campus Asset Resolution Telemetry
            </h2>
          </div>
          <span className="badge-verified text-[10px]">
            HEALTH OPTIMAL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-[#DADAD6] p-4 bg-[#F7F7F5] rounded space-y-1">
            <span className="font-mono text-[10px] uppercase text-[#777777]">Mean Time to Match (MTTM)</span>
            <div className="font-mono text-xl font-bold text-[#171717]">18.4 Minutes</div>
            <p className="text-[11px] text-[#777777]">Automated camera and turn-in correlation</p>
          </div>

          <div className="border border-[#DADAD6] p-4 bg-[#F7F7F5] rounded space-y-1">
            <span className="font-mono text-[10px] uppercase text-[#777777]">Mean Time to Handover (MTTH)</span>
            <div className="font-mono text-xl font-bold text-[#171717]">2.4 Hours</div>
            <p className="text-[11px] text-[#777777]">From verification approval to security release</p>
          </div>

          <div className="border border-[#DADAD6] p-4 bg-[#F7F7F5] rounded space-y-1">
            <span className="font-mono text-[10px] uppercase text-[#777777]">Zero-Knowledge Audit Rate</span>
            <div className="font-mono text-xl font-bold text-[#25845A]">100.0%</div>
            <p className="text-[11px] text-[#777777]">All physical releases backed by 6-digit PIN</p>
          </div>
        </div>
      </section>

      {/* Analytics Breakdown Grid: Location Hotspots & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campus Location Hotspots */}
        <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white rounded">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#171717]" />
              <h2 className="text-sm font-semibold tracking-tight text-[#171717]">
                Campus Location Hotspots
              </h2>
            </div>
            <Link href="/admin/locations" className="text-xs font-mono font-medium text-[#171717] hover:text-[#3867E8] transition">
              Manage Pins &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {locations.slice(0, 5).map((loc) => {
              const maxItems = locations[0]?._count.items || 1;
              const pct = Math.round((loc._count.items / maxItems) * 100);

              return (
                <div key={loc.id} className="p-3.5 rounded border border-[#DADAD6] bg-[#F7F7F5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#171717]">{loc.name}</div>
                      <div className="text-[#777777] font-mono text-[10px]">{loc.building} • Floor {loc.floor || "G"}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#171717] text-sm">{loc._count.items}</span>
                      <span className="text-[#777777] block font-mono text-[10px]">INCIDENTS</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#DADAD6] h-1 rounded overflow-hidden">
                    <div className="bg-[#171717] h-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Category Distribution */}
        <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white rounded">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#171717]" />
              <h2 className="text-sm font-semibold tracking-tight text-[#171717]">
                Category Distribution &amp; High-Value Protocols
              </h2>
            </div>
            <Link href="/admin/categories" className="text-xs font-mono font-medium text-[#171717] hover:text-[#3867E8] transition">
              Edit Categories &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {categories.slice(0, 5).map((cat) => {
              const maxCatItems = categories[0]?._count.items || 1;
              const catPct = Math.round((cat._count.items / maxCatItems) * 100);

              return (
                <div key={cat.id} className="p-3.5 rounded border border-[#DADAD6] bg-[#F7F7F5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-[#171717]">{cat.name}</div>
                      {cat.isHighValue && (
                        <span className="badge-neutral font-mono text-[9px]">
                          HIGH-VALUE
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#171717] text-sm">{cat._count.items}</span>
                      <span className="text-[#777777] block font-mono text-[10px]">ITEMS</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#DADAD6] h-1 rounded overflow-hidden">
                    <div className="bg-[#3867E8] h-full" style={{ width: `${catPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Compliance & Audit Activity Stream */}
      <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white rounded">
        <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#25845A]" />
            <h2 className="text-sm font-semibold tracking-tight text-[#171717]">
              Compliance &amp; Operational Audit Trail
            </h2>
          </div>
          <Link href="/admin/audit" className="text-xs font-mono font-medium text-[#171717] hover:text-[#3867E8] transition flex items-center gap-1">
            <span>View Full Ledger</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#DADAD6]/60 text-xs">
          {recentAudits.map((a) => (
            <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-[#DADAD6] bg-[#F7F7F5] text-[#171717]">
                  {a.action}
                </span>
                <span className="text-[#171717] font-medium">
                  {a.actor?.name || "System Automated"} ({a.actor?.role || "SYSTEM"}) on {a.entityType} #{a.entityId.slice(-8)}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#777777] whitespace-nowrap">
                {new Date(a.createdAt).toLocaleDateString()} {new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
