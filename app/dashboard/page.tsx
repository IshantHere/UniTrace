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
  Lock,
  Layers,
  FileText,
  Compass,
  Check,
} from "lucide-react";
import { getItemImageUrl } from "@/lib/images";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-[#171717]">
      {/* 1. Context & Operational Status Header */}
      <div className="border border-[#DADAD6] bg-white rounded-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#DADAD6] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              <span className="h-2 w-2 rounded-full bg-[#25845A]" />
              <span>TERMINAL ID: NEWTON-STU-CONSOLE</span>
              <span className="text-[#DADAD6]">•</span>
              <span>SEMESTER: ACTIVE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
              Student Asset Control Console: {user.name}
            </h1>
            <p className="text-xs text-[#555555]">
              Institutional Account: <span className="font-mono text-[#171717]">{user.email}</span> • Student ID:{" "}
              <span className="font-mono text-[#171717] font-semibold">{user.studentOrStaffId || "STU-2024-8841"}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/report/lost" className="btn-primary">
              <PlusCircle className="h-3.5 w-3.5 text-[#DC2626]" />
              Report Lost Property
            </Link>
            <Link href="/report/found" className="btn-secondary">
              <Sparkles className="h-3.5 w-3.5 text-[#25845A]" />
              Report Found Item
            </Link>
            <Link href="/search" className="btn-secondary">
              <Search className="h-3.5 w-3.5 text-[#777777]" />
              Search Registry
            </Link>
          </div>
        </div>

        {/* Operational Telemetry Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs font-mono">
          <div className="border-r border-[#DADAD6] pr-4 last:border-r-0">
            <div className="text-[10px] text-[#777777] uppercase tracking-wider">Active Lost Filings</div>
            <div className="text-2xl font-bold text-[#171717] mt-0.5">{activeReportsCount}</div>
            <div className="text-[10px] text-[#777777]">Under radar surveillance</div>
          </div>
          <div className="border-r border-[#DADAD6] pr-4 last:border-r-0">
            <div className="text-[10px] text-[#777777] uppercase tracking-wider">AI Match Candidates</div>
            <div className="text-2xl font-bold text-[#3867E8] mt-0.5">{topMatches.length}</div>
            <div className="text-[10px] text-[#3867E8]">High-confidence detections</div>
          </div>
          <div className="border-r border-[#DADAD6] pr-4 last:border-r-0">
            <div className="text-[10px] text-[#777777] uppercase tracking-wider">Active Ownership Claims</div>
            <div className="text-2xl font-bold text-[#C27803] mt-0.5">{pendingClaimsCount}</div>
            <div className="text-[10px] text-[#777777]">Security desk verification</div>
          </div>
          <div>
            <div className="text-[10px] text-[#777777] uppercase tracking-wider">Verified Recoveries</div>
            <div className="text-2xl font-bold text-[#25845A] mt-0.5">{recoveredCount}</div>
            <div className="text-[10px] text-[#777777]">Handover executed</div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME AI MATCH CANDIDATES: Side-by-Side Inspection */}
      {topMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3867E8]" />
              <h2 className="text-base font-bold tracking-tight text-[#171717]">
                Real-Time AI Match Candidates
              </h2>
            </div>
            <span className="badge-signal font-mono text-[10px]">
              ACTION REQUIRED: VERIFY PROBABLE SPECIMENS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topMatches.map((m) => (
              <div
                key={m.id}
                className="border border-[#DADAD6] bg-white rounded-md p-5 space-y-4 shadow-fine"
              >
                <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="badge-verified">
                      {Math.round(m.overallScore * 100)}% CONVERGENCE
                    </span>
                    <span className="text-[#777777] text-[10px]">TIER: {m.confidenceTier}</span>
                  </div>
                  <span className="text-[10px] text-[#777777]">{m.id}</span>
                </div>

                {/* Side-by-Side Photos */}
                <div className="grid grid-cols-2 gap-3 items-start">
                  <div className="space-y-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#777777]">
                      YOUR REPORTED SPECIMEN
                    </span>
                    <div className="aspect-[4/3] rounded-sm overflow-hidden border border-[#DADAD6] bg-[#F2F2EE]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getItemImageUrl(m.lostItem)}
                        alt="Lost specimen"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="font-semibold text-xs text-[#171717] truncate">{m.lostItem.title}</div>
                    <div className="text-[10px] text-[#777777] flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {m.lostItem.primaryLocation?.name || "Library Steps"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#25845A]">
                      INTAKE MATCH CANDIDATE
                    </span>
                    <div className="aspect-[4/3] rounded-sm overflow-hidden border border-[#DADAD6] bg-[#F2F2EE]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getItemImageUrl(m.foundItem)}
                        alt="Found specimen"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="font-semibold text-xs text-[#171717] truncate">{m.foundItem.title}</div>
                    <div className="text-[10px] text-[#777777] flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {m.foundItem.primaryLocation?.name || "Library Desk"}
                    </div>
                  </div>
                </div>

                {/* Top Evidence Overlap */}
                <div className="border border-[#DADAD6] rounded-sm bg-[#FBFBFA] p-3 text-xs space-y-1.5 font-mono">
                  <div className="text-[10px] font-semibold uppercase text-[#555555]">
                    Detected Overlap Signatures:
                  </div>
                  {m.evidence.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="flex items-center gap-1.5 text-[11px] text-[#171717]">
                      <Check className="h-3.5 w-3.5 text-[#25845A] flex-shrink-0" />
                      <span className="truncate">{ev.description}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#DADAD6]">
                  <Link
                    href={`/journey/${m.foundItemId}`}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[#777777] hover:text-[#171717]"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Inspect Transit Path
                  </Link>

                  <Link
                    href={`/match/${m.id}`}
                    className="btn-primary text-xs"
                  >
                    Verify Evidence Matrix <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ACTIVE CLAIMS & HANDOVER VERIFICATION QUEUE */}
      {userClaims.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-[#171717]">
              Active Ownership Claims &amp; Release PINs
            </h2>
            <span className="badge-neutral font-mono text-[10px]">
              ZERO-KNOWLEDGE VERIFICATION PROTOCOL
            </span>
          </div>

          <div className="border border-[#DADAD6] bg-white rounded-md divide-y divide-[#DADAD6] overflow-hidden">
            {userClaims.map((claim) => (
              <div key={claim.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-sm overflow-hidden border border-[#DADAD6] bg-[#F2F2EE] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getItemImageUrl(claim.item)}
                      alt={claim.item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#171717]">{claim.item.title}</span>
                      <span className="badge-signal font-mono text-[10px]">{claim.status}</span>
                    </div>
                    <div className="text-xs text-[#777777] flex items-center gap-2">
                      <span>Case ID: <span className="font-mono text-[#171717]">{claim.id}</span></span>
                      <span>•</span>
                      <span>Level: {claim.verificationLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {claim.handoverRecord ? (
                    <div className="border border-[#BCE3CE] bg-[#EBF6F0] p-2.5 rounded-md font-mono text-center">
                      <div className="text-[9px] uppercase tracking-wider text-[#25845A]">Handover PIN Issued</div>
                      <div className="text-base font-black text-[#25845A]">{claim.handoverRecord.handoverCode}</div>
                    </div>
                  ) : (
                    <div className="border border-[#DADAD6] bg-[#F7F7F5] p-2.5 rounded-md font-mono text-center">
                      <div className="text-[9px] uppercase tracking-wider text-[#777777]">Status</div>
                      <div className="text-xs font-semibold text-[#171717]">STAFF REVIEW PENDING</div>
                    </div>
                  )}

                  <Link
                    href={`/claims/new?itemId=${claim.itemId}`}
                    className="btn-secondary text-xs"
                  >
                    View Claim Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. PERSONAL ITEM ACTIVITY: High-Density Structured Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#171717]">
              Personal Item Registry
            </h2>
            <p className="text-xs text-[#777777]">
              All items currently registered under your campus student profile.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[#777777]">{userItems.length} ENTRIES</span>
        </div>

        {userItems.length === 0 ? (
          <div className="border border-[#DADAD6] rounded-md bg-white p-12 text-center space-y-3">
            <Tag className="h-6 w-6 text-[#777777] mx-auto" />
            <h3 className="text-sm font-bold text-[#171717]">No Personal Reports Logged</h3>
            <p className="text-xs text-[#777777] max-w-sm mx-auto">
              If you have misplaced an item or found abandoned property on campus, initiate a report to activate AI radar matching.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/report/lost" className="btn-primary">
                Report Lost Item
              </Link>
              <Link href="/report/found" className="btn-secondary">
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-[#DADAD6] bg-white rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#171717]">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-2.5">Item Record</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Facility Location</th>
                    <th className="px-4 py-2.5">Incident Date</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Radar Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAE6]">
                  {userItems.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-[#FBFBFA] transition">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-sm overflow-hidden border border-[#DADAD6] bg-[#F2F2EE] flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getItemImageUrl(item)}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-[#171717]">{item.title}</div>
                              <div className="font-mono text-[10px] text-[#777777]">{item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              item.type === "LOST"
                                ? "badge-red"
                                : "badge-verified"
                            }
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#555555]">
                          {item.primaryLocation?.name || "Main Campus"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#777777]">
                          {new Date(item.incidentDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge-neutral font-mono">{item.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/journey/${item.id}`}
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-[#3867E8] hover:underline"
                          >
                            Inspect Journey <ChevronRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}