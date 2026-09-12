import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  Compass,
  AlertTriangle,
  Lock,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

export default async function MatchDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      lostItem: {
        include: {
          category: true,
          primaryLocation: true,
          images: true,
          visualFingerprint: true,
          reporter: { select: { id: true, name: true } },
        },
      },
      foundItem: {
        include: {
          category: true,
          primaryLocation: true,
          images: true,
          visualFingerprint: true,
          reporter: { select: { id: true, name: true } },
          sightings: {
            include: { location: true },
            orderBy: { sequenceOrder: "asc" },
          },
        },
      },
      evidence: true,
    },
  });

  if (!match) {
    notFound();
  }

  // Check if current user already submitted a claim on this found item
  let existingClaim = null;
  if (user) {
    existingClaim = await prisma.claim.findFirst({
      where: {
        itemId: match.foundItemId,
        claimantId: user.id,
      },
      include: {
        handoverRecord: true,
      },
    });
  }

  const matchPct = Math.round(match.overallScore * 100);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-800">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800">Match Evidence</span>
            <span>/</span>
            <span className="font-mono text-slate-400">{match.id}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Multimodal Match Verification
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CONFIDENCE TIER: {match.confidenceTier}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Visual Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* LEFT: Lost Item */}
        <div className="card space-y-4 border-rose-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                REPORTED LOST
              </span>
              <span className="text-xs text-slate-400">Owner Submission</span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(match.lostItem.incidentDate).toLocaleDateString()}
            </span>
          </div>

          <div className="aspect-video w-full rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={match.lostItem.images[0]?.url || "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434"}
              alt={match.lostItem.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] text-white font-medium backdrop-blur-sm">
              Lost: {match.lostItem.primaryLocation.building}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">{match.lostItem.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              &quot;{match.lostItem.description}&quot;
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                <span className="font-semibold text-slate-800">{match.lostItem.category.name}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Seen</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {match.lostItem.primaryLocation.name}
                </span>
              </div>
            </div>

            {/* Extracted Visual Attributes */}
            {match.lostItem.visualFingerprint && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Visual Fingerprint (Lost)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200 font-medium text-slate-700">
                    Color: {match.lostItem.visualFingerprint.primaryColor}
                  </span>
                  {match.lostItem.visualFingerprint.brand && (
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200 font-medium text-slate-700">
                      Brand: {match.lostItem.visualFingerprint.brand}
                    </span>
                  )}
                  {match.lostItem.visualFingerprint.stickers && (
                    <span className="rounded bg-white px-2 py-0.5 border border-brand-200 font-medium text-brand-700">
                      Stickers: {match.lostItem.visualFingerprint.stickers}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Found Item */}
        <div className="card space-y-4 border-emerald-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                REPORTED FOUND
              </span>
              <span className="text-xs text-slate-400">Finder Intake</span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(match.foundItem.incidentDate).toLocaleDateString()}
            </span>
          </div>

          <div className="aspect-video w-full rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={match.foundItem.images[0]?.url || "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb"}
              alt={match.foundItem.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] text-white font-medium backdrop-blur-sm">
              Found: {match.foundItem.primaryLocation.building}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">{match.foundItem.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              &quot;{match.foundItem.description}&quot;
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                <span className="font-semibold text-slate-800">{match.foundItem.category.name}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Found At</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {match.foundItem.primaryLocation.name}
                </span>
              </div>
            </div>

            {/* Extracted Visual Attributes */}
            {match.foundItem.visualFingerprint && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Visual Fingerprint (Found)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200 font-medium text-slate-700">
                    Color: {match.foundItem.visualFingerprint.primaryColor}
                  </span>
                  {match.foundItem.visualFingerprint.brand && (
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200 font-medium text-slate-700">
                      Brand: {match.foundItem.visualFingerprint.brand}
                    </span>
                  )}
                  {match.foundItem.visualFingerprint.stickers && (
                    <span className="rounded bg-white px-2 py-0.5 border border-emerald-200 font-medium text-emerald-800">
                      Stickers: {match.foundItem.visualFingerprint.stickers}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MATCH CONFIDENCE & MULTI-SIGNAL EVIDENCE BREAKDOWN */}
      <div className="card border-brand-200 bg-gradient-to-b from-white to-slate-50/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-black text-2xl">
              {matchPct}%
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                UniTrace Match Confidence
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {matchPct >= 90 ? "Exceptional Multi-Signal Match" : "High Probability Correlation"}
              </h3>
              <p className="text-xs text-slate-500">
                Statistical convergence across visual, semantic, spatial, and temporal dimensions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/journey/${match.foundItemId}`}
              className="btn-secondary text-xs"
            >
              <Compass className="h-4 w-4 text-brand-600" />
              Trace Item Journey
            </Link>
          </div>
        </div>

        {/* Explainable Evidence Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Why UniTrace Suggested This Match (Explainable AI Evidence)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {match.evidence.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900">{ev.description}</div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Signal: {ev.signalType.replace(/_/g, " ")}</span>
                    <span>•</span>
                    <span>Confidence: {Math.round(ev.score * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Score Convergence Bar Chart */}
        <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Sub-Score Dimension Breakdown
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Visual Similarity</span>
              <span className="font-extrabold text-sm text-slate-900">
                {Math.round(match.visualScore * 100)}%
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Semantic Match</span>
              <span className="font-extrabold text-sm text-slate-900">
                {Math.round(match.semanticScore * 100)}%
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Attribute Overlap</span>
              <span className="font-extrabold text-sm text-slate-900">
                {Math.round(match.attributeScore * 100)}%
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Spatial Proximity</span>
              <span className="font-extrabold text-sm text-slate-900">
                {Math.round(match.locationScore * 100)}%
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 block">Time Window</span>
              <span className="font-extrabold text-sm text-slate-900">
                {Math.round(match.timeScore * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Probable Item Journey Preview */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Probable Item Journey Summary</h3>
          </div>
          <Link
            href={`/journey/${match.foundItemId}`}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Full Campus Map &amp; Timeline <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {match.foundItem.sightings.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {match.foundItem.sightings.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`rounded-xl border px-3 py-1.5 flex items-center gap-2 ${
                    s.sightingType === "OBSERVED"
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-purple-50 text-purple-900 border-purple-200"
                  }`}
                >
                  <span className="font-bold">{s.location.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1 rounded ${
                      s.sightingType === "OBSERVED"
                        ? "bg-emerald-500 text-black"
                        : "bg-purple-200 text-purple-800"
                    }`}
                  >
                    {s.sightingType}
                  </span>
                </div>
                {idx < match.foundItem.sightings.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Item currently logged at intake location.</p>
        )}
      </div>

      {/* NEXT STEP: OWNERSHIP VERIFICATION TRIGGER */}
      <div className="rounded-3xl border border-brand-300 bg-brand-900 text-white p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              Safety Principle: AI Match is Not Proof of Ownership
            </span>
            <h3 className="text-xl font-black text-white">
              Is this your item? Start Secure Ownership Verification
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              To release this property, you must answer private verification questions (e.g. distinctive markings or sticker details) that only the rightful owner would know.
            </p>
          </div>

          <div className="flex-shrink-0">
            {existingClaim ? (
              <div className="space-y-2 text-right">
                <span className="badge bg-emerald-500 text-black font-extrabold text-xs">
                  CLAIM ACTIVE ({existingClaim.status})
                </span>
                {existingClaim.handoverRecord && (
                  <div className="text-xs text-slate-200 font-mono">
                    PIN: <strong className="text-emerald-400">{existingClaim.handoverRecord.handoverCode}</strong>
                  </div>
                )}
                <Link
                  href="/claims"
                  className="block rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100"
                >
                  View Claim Status
                </Link>
              </div>
            ) : (
              <Link
                href={`/claims/new?itemId=${match.foundItemId}&lostItemId=${match.lostItemId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 active:scale-[0.98]"
              >
                <Lock className="h-4 w-4" />
                Start Ownership Verification
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
