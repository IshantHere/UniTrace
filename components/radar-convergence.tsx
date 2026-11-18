"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
  RefreshCw,
  ExternalLink,
  Flame,
} from "lucide-react";
import { getItemImageUrl } from "@/lib/images";

export interface RecoveredItem {
  id: string;
  type: string;
  title: string;
  status: string;
  description?: string | null;
  incidentDate: string | Date;
  updatedAt?: string | Date;
  primaryLocation?: {
    name: string;
    building?: string | null;
  } | null;
  category?: {
    name: string;
    slug?: string;
  } | null;
  images?: Array<{ url: string; thumbnailUrl?: string | null }>;
  isNew?: boolean;
}

interface RadarConvergenceProps {
  initialItems?: RecoveredItem[];
}

export function RadarConvergence({ initialItems = [] }: RadarConvergenceProps) {
  const [activeTab, setActiveTab] = useState<"RADAR" | "FOUND_ITEMS">("RADAR");
  const [items, setItems] = useState<RecoveredItem[]>(initialItems);
  const [livePulse, setLivePulse] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [simulating, setSimulating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Fetch latest recovered / newly found items from API
  const fetchLatestFoundItems = async () => {
    try {
      const res = await fetch("/api/items?status=RECOVERED&limit=8");
      const json = await res.json();
      if (json.success && json.data?.items) {
        setItems(json.data.items);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        setLivePulse(true);
        setTimeout(() => setLivePulse(false), 2000);
      }
    } catch {
      // Handled gracefully
    }
  };

  // Connect to SSE stream for live updates when new items are found / matched
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/events");

      eventSource.addEventListener("match", (e) => {
        try {
          const data = JSON.parse(e.data);
          const newItem: RecoveredItem = {
            id: data.foundItemId || data.matchId || `live_${Date.now()}`,
            type: "FOUND",
            title: data.itemTitle || "Recently Found Specimen",
            status: "RECOVERED",
            description: `Reunited item matched with ${Math.round((data.score || 0.94) * 100)}% visual confidence.`,
            incidentDate: new Date(),
            updatedAt: new Date(),
            primaryLocation: {
              name: data.locationName || "Campus Security Depot",
              building: "Security Depot",
            },
            images: data.itemImage ? [{ url: data.itemImage }] : [],
            isNew: true,
          };

          setItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
          setLivePulse(true);
          setLastSyncTime("Just now");
          setTimeout(() => setLivePulse(false), 3000);
        } catch (err) {
          console.error("[Radar] Error processing match event:", err);
        }
      });
    } catch {
      // Fallback
    }

    // Background interval sync every 10 seconds to catch newly reported found items
    const interval = setInterval(() => {
      fetchLatestFoundItems();
    }, 10000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const triggerLiveSimulation = async () => {
    setSimulating(true);
    try {
      await fetch("/api/demo/trigger-match");
      await fetchLatestFoundItems();
      setActiveTab("FOUND_ITEMS");
    } catch {
      // Handled
    } finally {
      setTimeout(() => setSimulating(false), 1200);
    }
  };

  const activeConvergenceScore = 94.2;

  return (
    <div className="control-surface border border-[#DADAD6] p-5 shadow-fine space-y-4 rounded-md bg-white">
      {/* Top Telemetry Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DADAD6] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              livePulse ? "bg-[#3867E8] scale-150 animate-ping" : "bg-[#25845A]"
            }`}
          />
          <span className="font-mono text-xs font-bold text-[#171717] tracking-tight">
            CAMPUS RADAR INTELLIGENCE
          </span>
          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-[#25845A]/30 bg-[#25845A]/10 text-[#25845A]">
            LIVE AUTO-SYNC
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 font-mono text-[10px] bg-[#F7F7F5] p-1 rounded border border-[#DADAD6]">
          <button
            type="button"
            onClick={() => setActiveTab("RADAR")}
            className={`px-2.5 py-1 rounded transition font-semibold ${
              activeTab === "RADAR"
                ? "bg-white text-[#171717] shadow-2xs border border-[#DADAD6]"
                : "text-[#777777] hover:text-[#171717]"
            }`}
          >
            CONVERGENCE
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FOUND_ITEMS")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition font-semibold ${
              activeTab === "FOUND_ITEMS"
                ? "bg-white text-[#171717] shadow-2xs border border-[#DADAD6]"
                : "text-[#777777] hover:text-[#171717]"
            }`}
          >
            <span>RECENTLY FOUND</span>
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#25845A] px-1 text-[9px] font-bold text-white">
              {items.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW A: Active Radar Convergence Analysis */}
      {activeTab === "RADAR" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase text-[#777777]">ACTIVE CORRELATION PAIR</span>
            <span className="badge-verified text-[10px]">STU-8841 / FND-1049</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-[#DADAD6] p-3 rounded-md bg-[#FBFBFA] space-y-1">
              <div className="font-mono text-[9px] text-[#DC2626] font-semibold uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                REPORTED LOST
              </div>
              <div className="font-semibold text-[#171717] truncate">AirPods Pro Case</div>
              <div className="text-[11px] text-[#777777]">16:30 • Library Steps</div>
            </div>

            <div className="border border-[#DADAD6] p-3 rounded-md bg-[#FBFBFA] space-y-1">
              <div className="font-mono text-[9px] text-[#25845A] font-semibold uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25845A]" />
                INTAKE LOGGED
              </div>
              <div className="font-semibold text-[#171717] truncate">White Charging Box</div>
              <div className="text-[11px] text-[#777777]">17:05 • Service Desk</div>
            </div>
          </div>

          {/* Progress and Convergence Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between font-mono text-[10px] text-[#777777]">
              <span>MULTIMODAL COMPOSITE SCORE</span>
              <span className="font-bold text-[#171717]">{activeConvergenceScore}%</span>
            </div>
            <div className="h-2 w-full bg-[#EAEAE6] rounded-sm overflow-hidden">
              <div
                className="h-full bg-[#171717] transition-all duration-1000"
                style={{ width: `${activeConvergenceScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-[#DADAD6] pt-3 font-mono text-[11px]">
            <div className="flex justify-between text-[#555555]">
              <span>Visual Fingerprint:</span>
              <span className="text-[#171717] font-semibold">0.96 (Sticker Matched)</span>
            </div>
            <div className="flex justify-between text-[#555555]">
              <span>Distance Corridor:</span>
              <span className="text-[#171717] font-semibold">140m (0.95 Proximity)</span>
            </div>
            <div className="flex justify-between text-[#555555]">
              <span>Time Delta Window:</span>
              <span className="text-[#171717] font-semibold">35 min (0.92 Window)</span>
            </div>
          </div>

          {/* Mini Live Ticker of Recently Reunited Property */}
          {items.length > 0 && (
            <div className="rounded border border-[#DADAD6] bg-[#F7F7F5] p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#25845A] flex-shrink-0" />
                <span className="font-mono text-[10px] text-[#777777] uppercase">LATEST RECOVERY:</span>
                <span className="font-medium text-[#171717] truncate">{items[0]?.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("FOUND_ITEMS")}
                className="font-mono text-[10px] text-[#3867E8] hover:underline flex-shrink-0 ml-2"
              >
                View Feed →
              </button>
            </div>
          )}

          <div className="pt-1 flex gap-2">
            <Link
              href="/match/match_airpods_golden"
              className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#171717] py-2.5 text-xs font-semibold text-white hover:bg-[#2C2C2C] transition"
            >
              <span>Examine Case File</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={triggerLiveSimulation}
              disabled={simulating}
              className="px-3 rounded-md border border-[#DADAD6] bg-[#F7F7F5] hover:bg-[#EAEAE6] transition font-mono text-[10px] text-[#171717] font-medium"
              title="Broadcast real-time found match alert"
            >
              {simulating ? "SIMULATING..." : "SIMULATE"}
            </button>
          </div>
        </div>
      )}

      {/* VIEW B: Recently Found Items That Were Lost (Live Updating Feed) */}
      {activeTab === "FOUND_ITEMS" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs border-b border-[#DADAD6] pb-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#777777] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#25845A]" />
              <span>REUNITED &amp; RECOVERED FEED</span>
            </div>
            <span className="font-mono text-[9px] text-[#777777]">
              SYNC: {lastSyncTime}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const photoUrl = getItemImageUrl(item);
              const locationLabel = item.primaryLocation?.name || "Campus Security Depot";

              return (
                <div
                  key={item.id || idx}
                  className={`flex items-center gap-3 p-2.5 rounded border transition ${
                    item.isNew
                      ? "border-[#25845A] bg-[#25845A]/5 animate-pulse"
                      : "border-[#DADAD6] bg-[#FBFBFA] hover:border-[#171717]"
                  }`}
                >
                  {/* Photo Thumbnail with smart fallback */}
                  <div className="h-12 w-12 rounded overflow-hidden border border-[#DADAD6] bg-white flex-shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-[#171717] truncate">
                        {item.title}
                      </span>
                      <span className="font-mono text-[9px] text-[#25845A] font-semibold px-1 rounded bg-[#25845A]/10 border border-[#25845A]/20 flex-shrink-0">
                        RECOVERED
                      </span>
                    </div>

                    <div className="text-[11px] text-[#777777] flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{locationLabel}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#777777] pt-0.5">
                      <span>Status: Reunited with Owner</span>
                      <Link
                        href={`/journey/${item.id}`}
                        className="text-[#3867E8] hover:underline inline-flex items-center gap-0.5"
                      >
                        Journey <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#DADAD6] flex items-center justify-between text-xs">
            <Link
              href="/search?status=RECOVERED"
              className="font-mono text-[11px] text-[#171717] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Browse All Reunited Registry <ArrowRight className="h-3 w-3" />
            </Link>

            <button
              type="button"
              onClick={triggerLiveSimulation}
              disabled={simulating}
              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#25845A] bg-[#25845A]/10 border border-[#25845A]/20 px-2 py-1 rounded hover:bg-[#25845A]/20 transition"
            >
              <Sparkles className="h-3 w-3" />
              <span>{simulating ? "Simulating..." : "Simulate Found"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
