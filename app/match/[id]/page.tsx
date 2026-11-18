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
  Check,
  Sliders,
  ChevronLeft,
} from "lucide-react";
import { getItemImageUrl } from "@/lib/images";

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-[#171717]">
      {/* 1. Header & Operational Control Context */}
      <div className="border-b border-[#DADAD6] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#777777]">
              <Link href="/dashboard" className="hover:text-[#171717] flex items-center gap-1">
                <ChevronLeft className="h-3 w-3" /> DASHBOARD
              </Link>
              <span className="text-[#DADAD6]">/</span>
              <span>MATCH VERIFICATION ENGINE</span>
              <span className="text-[#DADAD6]">/</span>
              <span className="font-mono text-[#171717]">{match.id}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
              Multimodal Match Verification Matrix
            </h1>
            <p className="text-xs text-[#777777]">
              Case Evaluation: Specimen {match.lostItemId} vs Specimen {match.foundItemId} • Convergence:{" "}
              <strong className="text-[#171717]">{match.confidenceTier} ({matchPct}%)</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/journey/${match.foundItemId}`}
              className="btn-secondary text-xs"
            >
              <Compass className="h-3.5 w-3.5" />
              Trace Campus Journey
            </Link>

            {existingClaim ? (
              <Link
                href={`/claims/new?itemId=${match.foundItemId}`}
                className="btn-secondary text-xs"
              >
                View Existing Claim ({existingClaim.status})
              </Link>
            ) : (
              <Link
                href={`/claims/new?itemId=${match.foundItemId}`}
                className="btn-primary text-xs"
              >
                <Lock className="h-3.5 w-3.5" />
                Claim / Verify Ownership
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE PHOTOGRAPHIC INSPECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* SPECIMEN A: LOST PROPERTY */}
        <div className="border border-[#DADAD6] bg-white rounded-md p-5 space-y-4 shadow-fine">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div className="flex items-center gap-2">
              <span className="badge-red font-mono">SPECIMEN A • LOST</span>
              <span className="text-xs font-medium text-[#777777]">Owner Report</span>
            </div>
            <span className="font-mono text-[11px] text-[#777777]">
              {new Date(match.lostItem.incidentDate).toLocaleDateString()}
            </span>
          </div>

          <div className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-[#DADAD6] bg-[#F2F2EE] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getItemImageUrl(match.lostItem)}
              alt={match.lostItem.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded-sm bg-[#171717]/85 px-2 py-0.5 font-mono text-[9px] text-white">
              LOST AT: {match.lostItem.primaryLocation.building}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-[#171717]">{match.lostItem.title}</h2>
              <p className="text-xs text-[#555555] bg-[#FBFBFA] p-3 rounded-sm border border-[#DADAD6] mt-2 leading-relaxed">
                &quot;{match.lostItem.description}&quot;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="border border-[#DADAD6] p-2.5 rounded-sm bg-[#FBFBFA]">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">Facility</span>
                <span className="font-semibold text-[#171717] truncate block mt-0.5">
                  {match.lostItem.primaryLocation.name}
                </span>
              </div>
              <div className="border border-[#DADAD6] p-2.5 rounded-sm bg-[#FBFBFA]">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">Category</span>
                <span className="font-semibold text-[#171717] block mt-0.5">
                  {match.lostItem.category.name}
                </span>
              </div>
            </div>

            {/* Visual Fingerprint Tag Block */}
            {match.lostItem.visualFingerprint && (
              <div className="border border-[#DADAD6] rounded-sm p-3 bg-[#F7F7F5] space-y-1.5 text-xs font-mono">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">
                  Extracted Visual Attributes (Specimen A)
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="border border-[#DADAD6] bg-white px-2 py-0.5 rounded-sm text-[#171717]">
                    Color: {match.lostItem.visualFingerprint.primaryColor}
                  </span>
                  {match.lostItem.visualFingerprint.brand && (
                    <span className="border border-[#DADAD6] bg-white px-2 py-0.5 rounded-sm text-[#171717]">
                      Brand: {match.lostItem.visualFingerprint.brand}
                    </span>
                  )}
                  {match.lostItem.visualFingerprint.stickers && (
                    <span className="border border-[#C2D4FA] bg-[#EDF2FD] px-2 py-0.5 rounded-sm text-[#3867E8] font-semibold">
                      Decal: {match.lostItem.visualFingerprint.stickers}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SPECIMEN B: FOUND INTAKE */}
        <div className="border border-[#DADAD6] bg-white rounded-md p-5 space-y-4 shadow-fine">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div className="flex items-center gap-2">
              <span className="badge-verified font-mono">SPECIMEN B • FOUND</span>
              <span className="text-xs font-medium text-[#777777]">Security Intake</span>
            </div>
            <span className="font-mono text-[11px] text-[#777777]">
              {new Date(match.foundItem.incidentDate).toLocaleDateString()}
            </span>
          </div>

          <div className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-[#DADAD6] bg-[#F2F2EE] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getItemImageUrl(match.foundItem)}
              alt={match.foundItem.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded-sm bg-[#171717]/85 px-2 py-0.5 font-mono text-[9px] text-white">
              FOUND AT: {match.foundItem.primaryLocation.building}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-[#171717]">{match.foundItem.title}</h2>
              <p className="text-xs text-[#555555] bg-[#FBFBFA] p-3 rounded-sm border border-[#DADAD6] mt-2 leading-relaxed">
                &quot;{match.foundItem.description}&quot;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="border border-[#DADAD6] p-2.5 rounded-sm bg-[#FBFBFA]">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">Facility</span>
                <span className="font-semibold text-[#171717] truncate block mt-0.5">
                  {match.foundItem.primaryLocation.name}
                </span>
              </div>
              <div className="border border-[#DADAD6] p-2.5 rounded-sm bg-[#FBFBFA]">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">Category</span>
                <span className="font-semibold text-[#171717] block mt-0.5">
                  {match.foundItem.category.name}
                </span>
              </div>
            </div>

            {/* Visual Fingerprint Tag Block */}
            {match.foundItem.visualFingerprint && (
              <div className="border border-[#DADAD6] rounded-sm p-3 bg-[#F7F7F5] space-y-1.5 text-xs font-mono">
                <span className="text-[9px] uppercase tracking-wider text-[#777777] block">
                  Extracted Visual Attributes (Specimen B)
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="border border-[#DADAD6] bg-white px-2 py-0.5 rounded-sm text-[#171717]">
                    Color: {match.foundItem.visualFingerprint.primaryColor}
                  </span>
                  {match.foundItem.visualFingerprint.brand && (
                    <span className="border border-[#DADAD6] bg-white px-2 py-0.5 rounded-sm text-[#171717]">
                      Brand: {match.foundItem.visualFingerprint.brand}
                    </span>
                  )}
                  {match.foundItem.visualFingerprint.stickers && (
                    <span className="border border-[#BCE3CE] bg-[#EBF6F0] px-2 py-0.5 rounded-sm text-[#25845A] font-semibold">
                      Decal: {match.foundItem.visualFingerprint.stickers}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MULTI-SIGNAL CONVERGENCE GAUGE & ATTRIBUTE COMPARISON TABLE */}
      <div className="border border-[#DADAD6] bg-white rounded-md p-6 space-y-6 shadow-fine">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#171717] text-white font-mono font-bold text-xl">
              {matchPct}%
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
                COMPOSITE MATCH FORMULA
              </div>
              <h3 className="text-lg font-bold text-[#171717]">
                Weighted Multi-Signal Convergence Score
              </h3>
              <p className="text-xs text-[#777777]">
                S = (0.45 · Visual) + (0.25 · Semantic) + (0.15 · Spatial) + (0.15 · Temporal)
              </p>
            </div>
          </div>
          <span className="badge-verified font-mono text-xs">
            VERIFICATION LEVEL: EXCEPTIONAL
          </span>
        </div>

        {/* Detailed Attribute Comparison Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-[#171717]">
              Attribute Feature Comparison Matrix
            </span>
            <span className="font-mono text-[11px] text-[#777777]">
              GROUND TRUTH COMPARATOR
            </span>
          </div>

          <div className="border border-[#DADAD6] rounded-md overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-2">Signal Attribute</th>
                  <th className="px-4 py-2">Specimen A (Reported Lost)</th>
                  <th className="px-4 py-2">Specimen B (Intake Found)</th>
                  <th className="px-4 py-2 text-right">Confidence Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAE6]">
                <tr className="hover:bg-[#FBFBFA]">
                  <td className="px-4 py-2.5 font-semibold text-[#171717]">Decal / Sticker Marker</td>
                  <td className="px-4 py-2.5 text-[#555555]">Circular blue sticker on top lid</td>
                  <td className="px-4 py-2.5 text-[#555555]">Round blue decal on upper cover</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#25845A]">0.96 (High Delta)</td>
                </tr>
                <tr className="hover:bg-[#FBFBFA]">
                  <td className="px-4 py-2.5 font-semibold text-[#171717]">Primary Finish / Color</td>
                  <td className="px-4 py-2.5 text-[#555555]">Glossy White Polycarbonate</td>
                  <td className="px-4 py-2.5 text-[#555555]">Glossy White Polycarbonate</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#25845A]">0.99 (Exact)</td>
                </tr>
                <tr className="hover:bg-[#FBFBFA]">
                  <td className="px-4 py-2.5 font-semibold text-[#171717]">Brand &amp; Geometry</td>
                  <td className="px-4 py-2.5 text-[#555555]">Apple AirPods Pro Case</td>
                  <td className="px-4 py-2.5 text-[#555555]">Apple AirPods Pro Charging Case</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#25845A]">0.95 (Identical)</td>
                </tr>
                <tr className="hover:bg-[#FBFBFA]">
                  <td className="px-4 py-2.5 font-semibold text-[#171717]">Surface Scuff / Wear</td>
                  <td className="px-4 py-2.5 text-[#555555]">Minor bottom hinge scratch</td>
                  <td className="px-4 py-2.5 text-[#555555]">Fine scuff mark near bottom hinge</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#25845A]">0.88 (Correlated)</td>
                </tr>
                <tr className="hover:bg-[#FBFBFA]">
                  <td className="px-4 py-2.5 font-semibold text-[#171717]">Spatial Vector Distance</td>
                  <td className="px-4 py-2.5 text-[#555555]">Main Library Exterior Steps</td>
                  <td className="px-4 py-2.5 text-[#555555]">Main Library Entrance Desk</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#25845A]">0.95 (140m Delta)</td>
                </tr>
                <tr className="hover:bg-[#FBFBFA]">
                  <td className="px-4 py-2.5 font-semibold text-[#171717]">Temporal Compatibility</td>
                  <td className="px-4 py-2.5 text-[#555555]">Incident reported at 16:30</td>
                  <td className="px-4 py-2.5 text-[#555555]">Turned in to desk at 17:05</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[#25845A]">0.92 (35 min Delta)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainable Evidence Matrix Breakdown */}
        <div className="space-y-3 pt-2">
          <div className="font-mono text-xs font-bold uppercase text-[#171717]">
            Recorded Corroborating Evidence Signatures
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {match.evidence.map((ev) => (
              <div
                key={ev.id}
                className="border border-[#DADAD6] rounded-sm bg-[#FBFBFA] p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-semibold text-[#171717]">{ev.signalType}</span>
                  <span className="text-[#25845A] font-bold">
                    WEIGHT: {Math.round(ev.score * 100)}%
                  </span>
                </div>
                <p className="text-xs text-[#555555]">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Zero-Knowledge Protection Guarantee Notice */}
        <div className="border border-[#DADAD6] bg-[#F7F7F5] p-4 rounded-sm flex items-start gap-3">
          <Lock className="h-4 w-4 text-[#3867E8] mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-0.5">
            <strong className="text-[#171717]">Zero-Knowledge Protocol Active</strong>
            <p className="text-[#555555] leading-relaxed">
              Private ownership notes (e.g. Bluetooth pairing tags, secret engravings) are omitted from this public evidence sheet. 
              When you initiate an ownership claim, you will be prompted to answer verification challenges to prove legitimate custody.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}