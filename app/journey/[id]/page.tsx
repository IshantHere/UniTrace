import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getItemJourneyTimeline } from "@/lib/journey/tracker";
import { CampusMap, MapPoint } from "@/components/map/campus-map";
import {
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Lock,
  ChevronLeft,
} from "lucide-react";

export default async function ItemJourneyPage({
  params,
}: {
  params: { id: string };
}) {
  let timeline;
  try {
    timeline = await getItemJourneyTimeline(params.id);
  } catch (e) {
    notFound();
  }

  const mapPoints: MapPoint[] = timeline.events.map((e) => ({
    id: e.id,
    sequence: e.sequence,
    name: e.locationName,
    building: e.building,
    timestamp: e.timestamp,
    sightingType: e.sightingType,
    confidence: e.confidence,
    reportedBy: e.reportedBy,
    notes: e.notes,
    isCurrentLocation: e.isCurrentLocation,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-800 flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800">Probable Item Journey</span>
            <span>/</span>
            <span className="font-mono text-slate-400">{timeline.itemId}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {timeline.itemTitle}
          </h1>
          <p className="text-xs text-slate-500">
            Status: <span className="font-bold text-slate-800">{timeline.status}</span> • Current Location:{" "}
            <span className="font-bold text-slate-800">{timeline.lastKnownLocation || "Intake Desk"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/claims/new?itemId=${timeline.itemId}`}
            className="btn-primary"
          >
            <Lock className="h-4 w-4" />
            Claim / Verify Ownership
          </Link>
        </div>
      </div>

      {/* Signature Feature Explainer Alert */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-900">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <span>UniTrace Signature Feature: Probable Item Journey</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          UniTrace reconstructs item movement across campus facilities. To ensure complete operational integrity, every checkpoint clearly distinguishes between verified human reports (<strong>OBSERVED</strong>) and algorithmic corridor interpolations (<strong>AI-INFERRED</strong>).
        </p>
      </div>

      {/* Interactive Campus Map Visualizer */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-brand-600" />
            Spatio-Temporal Campus Radar &amp; Trajectory
          </h2>
          <span className="text-xs text-slate-400">Click pins to inspect checkpoint data</span>
        </div>

        <CampusMap points={mapPoints} />
      </section>

      {/* Chronological Vertical Timeline */}
      <section className="card space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chronological Sighting Timeline</h2>
            <p className="text-xs text-slate-500">Step-by-step movement history on campus</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {timeline.events.length} Checkpoints Logged
          </span>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
          {timeline.events.map((ev) => {
            const isObserved = ev.sightingType === "OBSERVED";
            const dateObj = new Date(ev.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const dateStr = dateObj.toLocaleDateString();

            return (
              <div key={ev.id} className="relative space-y-2">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${
                    isObserved ? "bg-emerald-600 ring-4 ring-emerald-100" : "bg-purple-600 ring-4 ring-purple-100"
                  }`}
                >
                  {ev.sequence}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{ev.locationName}</span>
                    <span className="text-xs text-slate-400 font-medium">({ev.building})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        isObserved
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-purple-50 text-purple-800 border border-purple-200"
                      }`}
                    >
                      {isObserved ? "✓ OBSERVED SIGHTING" : "⚡ AI-INFERRED TRANSITION"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {Math.round(ev.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {timeStr} • {dateStr}
                  </span>
                  <span>•</span>
                  <span>Reported by: <strong>{ev.reportedBy}</strong></span>
                </div>

                {ev.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {ev.notes}
                  </p>
                )}

                {ev.isCurrentLocation && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-900 px-2.5 py-1 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Current Secure Location: Ready for Ownership Verification
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
