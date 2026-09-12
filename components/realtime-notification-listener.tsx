"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, X, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

interface MatchToast {
  type: "match";
  matchId: string;
  itemTitle: string;
  itemImage?: string;
  score: number;
  confidenceTier: string;
  locationName: string;
}

interface ClaimToast {
  type: "claim";
  claimId: string;
  itemTitle: string;
  status: string;
  handoverCode?: string;
}

type ActiveNotification = MatchToast | ClaimToast;

export function RealtimeNotificationListener() {
  const [activeNotification, setActiveNotification] = useState<ActiveNotification | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize pleasant chime using Web Audio API (zero external assets)
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Dual-tone harmonic chime (D5 -> A5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {
      // Audio playback restrictions safely handled
    }
  };

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/events");

      eventSource.addEventListener("match", (e) => {
        try {
          const data = JSON.parse(e.data);
          setActiveNotification({
            type: "match",
            matchId: data.matchId,
            itemTitle: data.itemTitle,
            itemImage: data.itemImage,
            score: data.score,
            confidenceTier: data.confidenceTier,
            locationName: data.locationName,
          });
          playChime();

          if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = setTimeout(() => {
            setActiveNotification(null);
          }, 12000);
        } catch (err) {
          console.error("[Realtime] Error processing match event:", err);
        }
      });

      eventSource.addEventListener("claim", (e) => {
        try {
          const data = JSON.parse(e.data);
          setActiveNotification({
            type: "claim",
            claimId: data.claimId,
            itemTitle: data.itemTitle,
            status: data.status,
            handoverCode: data.handoverCode,
          });
          playChime();

          if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = setTimeout(() => {
            setActiveNotification(null);
          }, 12000);
        } catch (err) {
          console.error("[Realtime] Error processing claim event:", err);
        }
      });
    } catch (err) {
      console.warn("[Realtime] EventSource connection failed:", err);
    }

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (eventSource) eventSource.close();
    };
  }, []);

  if (!activeNotification) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Real-time Notification"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full rounded-2xl border border-emerald-400/40 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-3">
        {activeNotification.type === "match" ? (
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/40">
              <Sparkles className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  ⚡ Live AI Match Detected!
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                {Math.round(activeNotification.score * 100)}% Match • {activeNotification.confidenceTier}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-400/40">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                🔐 Claim Status Update
              </span>
              <p className="text-[11px] font-semibold text-slate-400">
                {activeNotification.status.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setActiveNotification(null)}
          aria-label="Dismiss notification"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3.5 space-y-1.5">
        <p className="text-sm font-semibold text-slate-100 line-clamp-1">
          {activeNotification.type === "match" ? (
            <>
              Found item matches: <strong className="text-white">{activeNotification.itemTitle}</strong>
            </>
          ) : (
            <>
              Item: <strong className="text-white">{activeNotification.itemTitle}</strong>
            </>
          )}
        </p>

        {activeNotification.type === "match" && (
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Located at {activeNotification.locationName}</span>
          </p>
        )}

        {activeNotification.type === "claim" && activeNotification.handoverCode && (
          <div className="mt-2 rounded-xl bg-slate-900 p-2.5 border border-indigo-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-400">Handover Security PIN:</span>
            <div className="font-mono text-lg font-black text-indigo-400 tracking-wider">
              {activeNotification.handoverCode}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {activeNotification.type === "match" ? (
          <Link
            href={`/match/${activeNotification.matchId}`}
            onClick={() => setActiveNotification(null)}
            className="flex-1 rounded-xl bg-emerald-500 py-2 px-3 text-center text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            Review Match <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href="/claims"
            onClick={() => setActiveNotification(null)}
            className="flex-1 rounded-xl bg-indigo-600 py-2 px-3 text-center text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition flex items-center justify-center gap-1.5"
          >
            View Claim <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}

        <button
          onClick={() => setActiveNotification(null)}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}
