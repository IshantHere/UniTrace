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
  Check,
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-[#171717]">
      {/* Control Room Header & Telemetry */}
      <div className="border-b border-[#DADAD6] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#777777]">
              <Link href="/dashboard" className="hover:text-[#171717] flex items-center gap-1">
                <ChevronLeft className="h-3 w-3" /> DASHBOARD
              </Link>
              <span className="text-[#DADAD6]">/</span>
              <span>SPATIAL RADAR</span>
              <span className="text-[#DADAD6]">/</span>
              <span className="font-mono text-[#171717]">{timeline.itemId}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
              Probable Campus Journey: {timeline.itemTitle}
            </h1>
            <p className="text-xs text-[#777777]">
              Current Custody Station:{" "}
              <strong className="text-[#171717]">{timeline.lastKnownLocation || "Central Security Desk"}</strong> •{" "}
              Status: <span className="badge-neutral font-mono">{timeline.status}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/claims/new?itemId=${timeline.itemId}`}
              className="btn-primary text-xs"
            >
              <Lock className="h-3.5 w-3.5" />
              Claim / Verify Ownership
            </Link>
          </div>
        </div>
      </div>

      {/* Protocol Banner: Observed vs Inferred Distinction */}
      <div className="border border-[#DADAD6] bg-white rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#25845A]" />
          <div>
            <span className="font-bold text-[#171717]">INTEGRITY RULE: </span>
            <span className="text-[#555555]">
              Observed sightings denote physical verified human intake. Inferred segments denote algorithmic shortest-path corridor predictions.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 text-[10px]">
          <span className="badge-verified">OBSERVED = 100% FACT</span>
          <span className="badge-signal">INFERRED = PROBABILITY</span>
        </div>
      </div>

      {/* Primary Map Workspace */}
      <section className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[11px] text-[#777777]">
          <span className="flex items-center gap-1.5 uppercase font-bold text-[#171717]">
            <Compass className="h-3.5 w-3.5 text-[#3867E8]" />
            Newton University Spatial Coordinate Grid (1000m × 600m)
          </span>
          <span>SELECT CHECKPOINT NODES TO AUDIT TIMESTAMPS</span>
        </div>

        <CampusMap points={mapPoints} />
      </section>

      {/* Chronological Sighting Telemetry Timeline */}
      <section className="border border-[#DADAD6] bg-white rounded-md p-6 space-y-6 shadow-fine">
        <div className="flex items-center justify-between border-b border-[#DADAD6] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#171717]">
              Chronological Sighting Timeline &amp; Custody Transitions
            </h2>
            <p className="text-xs text-[#777777]">Sequential record of human sightings and inferred transit corridors</p>
          </div>
          <span className="font-mono text-xs text-[#777777]">
            {timeline.events.length} CHECKPOINTS RECORDED
          </span>
        </div>

        <div className="relative border-l border-[#DADAD6] ml-4 pl-6 space-y-8 font-mono">
          {timeline.events.map((ev) => {
            const isObserved = ev.sightingType === "OBSERVED";
            const dateObj = new Date(ev.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const dateStr = dateObj.toLocaleDateString();

            return (
              <div key={ev.id} className="relative space-y-2 text-xs">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-sm font-bold text-white text-[10px] ${
                    isObserved ? "bg-[#25845A]" : "bg-[#3867E8]"
                  }`}
                >
                  {ev.sequence}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#171717]">{ev.locationName}</span>
                    <span className="text-[#777777]">({ev.building})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={
                        isObserved
                          ? "badge-verified"
                          : "badge-signal"
                      }
                    >
                      {isObserved ? "OBSERVED SIGHTING" : "AI-INFERRED CORRIDOR"}
                    </span>
                    <span className="border border-[#DADAD6] bg-[#F7F7F5] px-2 py-0.5 rounded-sm text-[10px] text-[#555555]">
                      {Math.round(ev.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[#777777]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#777777]" />
                    {timeStr} • {dateStr}
                  </span>
                  <span>•</span>
                  <span>Recorded Source: <strong className="text-[#171717]">{ev.reportedBy}</strong></span>
                </div>

                {ev.notes && (
                  <p className="text-xs text-[#555555] bg-[#FBFBFA] p-3 rounded-sm border border-[#DADAD6] leading-relaxed">
                    &quot;{ev.notes}&quot;
                  </p>
                )}

                {ev.isCurrentLocation && (
                  <div className="inline-flex items-center gap-1.5 border border-[#BCE3CE] bg-[#EBF6F0] text-[#25845A] px-2.5 py-1 text-[11px] font-bold rounded-sm">
                    <Check className="h-3.5 w-3.5 text-[#25845A]" />
                    CURRENT PHYSICAL LOCATION: CENTRAL SECURITY DESK (LOCKER #04)
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