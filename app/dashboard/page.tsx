import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Tag,
  MapPin,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user's reported items
  const userItems = await prisma.item.findMany({
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

  // Fetch user claims
  const userClaims = await prisma.claim.findMany({
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

  // Fetch high-confidence matches across the platform for suggestions
  const topMatches = await prisma.match.findMany({
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

  const activeReportsCount = userItems.filter((i) => ["ACTIVE", "MATCH_PENDING"].includes(i.status)).length;
  const recoveredCount = userItems.filter((i) => i.status === "RECOVERED").length;
  const pendingClaimsCount = userClaims.filter((c) => !["COMPLETED", "REJECTED"].includes(c.status)).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user.institution?.name || "Apex University"} • Student ID: {user.studentOrStaffId || "STU-ACTIVE"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/report/lost" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Report Lost Item
          </Link>
          <Link href="/report/found" className="btn-secondary">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Report Found Item
          </Link>
          <Link href="/search" className="btn-outline">
            <Search className="h-4 w-4 text-slate-500" />
            Search
          </Link>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Reports</div>
          <div className="text-2xl font-extrabold text-slate-900">{activeReportsCount}</div>
          <div className="text-[10px] text-slate-500">Monitoring campus intake</div>
        </div>

        <div className="card p-4 space-y-1 bg-emerald-50/40 border-emerald-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Possible Matches</div>
          <div className="text-2xl font-extrabold text-emerald-700">{topMatches.length}</div>
          <div className="text-[10px] text-emerald-600 font-medium">High-confidence candidates</div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Claims</div>
          <div className="text-2xl font-extrabold text-brand-600">{pendingClaimsCount}</div>
          <div className="text-[10px] text-slate-500">Under staff verification</div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recovered Items</div>
          <div className="text-2xl font-extrabold text-indigo-600">{recoveredCount}</div>
          <div className="text-[10px] text-slate-500">Successfully returned</div>
        </div>
      </div>

      {/* High Confidence Matches Alert Banner */}
      {topMatches.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                AI
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">High-Confidence Matches Detected</h2>
                <p className="text-xs text-slate-600">
                  UniTrace AI converged multi-signal evidence for your reported items.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {topMatches.map((m) => (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800">
                      {Math.round(m.overallScore * 100)}% MATCH
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Recent
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Your Report</span>
                      <div className="aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.lostItem.images[0]?.url || "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434"}
                          alt="Lost item"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="font-semibold text-xs text-slate-900 truncate">{m.lostItem.title}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Candidate Found</span>
                      <div className="aspect-video rounded-lg bg-slate-100 overflow-hidden border border-emerald-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.foundItem.images[0]?.url || "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb"}
                          alt="Found item"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="font-semibold text-xs text-slate-900 truncate">{m.foundItem.title}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="font-semibold text-[11px] text-slate-700">Top Evidence Signals:</div>
                    {m.evidence.slice(0, 2).map((ev) => (
                      <div key={ev.id} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{ev.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/journey/${m.foundItemId}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    View Timeline
                  </Link>
                  <Link
                    href={`/match/${m.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Inspect &amp; Verify <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Active Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Active Reports</h2>
          <span className="text-xs text-slate-500">{userItems.length} total submissions</span>
        </div>

        {userItems.length === 0 ? (
          <div className="card text-center py-12 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Tag className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No active reports yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you misplaced an item or found someone else&apos;s property, file a report to activate UniTrace multimodal matching.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/report/lost" className="btn-primary">
                Report Lost Item
              </Link>
              <Link href="/report/found" className="btn-secondary">
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userItems.map((item) => {
              const matchCount = item.type === "LOST" ? item.lostMatches.length : item.foundMatches.length;
              const hasHighMatch = item.type === "LOST"
                ? item.lostMatches.some((m) => m.overallScore >= 0.75)
                : item.foundMatches.some((m) => m.overallScore >= 0.75);

              return (
                <div key={item.id} className="card p-4 space-y-4 hover:border-slate-300 transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`badge ${
                          item.type === "LOST"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.images[0]?.url || "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434"}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {item.primaryLocation.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(item.incidentDate).toLocaleDateString()} {item.incidentTime && `at ${item.incidentTime}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs">
                      {matchCount > 0 ? (
                        <span className={`font-bold ${hasHighMatch ? "text-emerald-700" : "text-brand-600"}`}>
                          {matchCount} match{matchCount > 1 ? "es" : ""} found
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Scanning pool...</span>
                      )}
                    </div>

                    {item.type === "LOST" && item.lostMatches[0] ? (
                      <Link
                        href={`/match/${item.lostMatches[0].id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        Inspect Match <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/journey/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Timeline <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Claims & Handover Section */}
      {userClaims.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Ownership Claims</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {userClaims.map((claim) => (
              <div key={claim.id} className="card p-5 space-y-3 border-brand-200">
                <div className="flex items-center justify-between">
                  <span className="badge bg-brand-100 text-brand-800">CLAIM STATUS: {claim.status}</span>
                  <span className="text-xs text-slate-500">{new Date(claim.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="font-bold text-sm text-slate-900">{claim.item.title}</div>
                <div className="text-xs text-slate-600">Location: {claim.item.primaryLocation.name}</div>

                {claim.handoverRecord && (
                  <div className="rounded-xl bg-slate-900 text-white p-3.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      Handover Verification PIN
                    </div>
                    <div className="text-xl font-mono font-black tracking-widest text-emerald-400">
                      {claim.handoverRecord.handoverCode}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Present this PIN and your student ID card at{" "}
                      <strong>{claim.handoverRecord.handoverLocation.name}</strong> to receive your property.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
