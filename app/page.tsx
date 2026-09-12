import Link from "next/link";
import {
  Sparkles,
  Search,
  PlusCircle,
  ShieldCheck,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Layers,
  FileCheck,
  Lock,
  GitFork,
  Check,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function LandingPage() {
  // Fetch real counts from database
  let totalItems = 0;
  let activeMatches = 0;
  let locationsCount = 0;

  try {
    totalItems = await prisma.item.count();
    activeMatches = await prisma.match.count();
    locationsCount = await prisma.location.count();
  } catch (e) {
    // fallback
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-16 pb-20 border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-600 animate-spin" />
              <span>Next-Gen Campus Intelligence • Multimodal AI Matching</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.15]">
              Lost doesn&apos;t mean gone.
            </h1>

            <p className="text-lg text-slate-600 sm:text-xl font-normal leading-relaxed">
              AI-powered campus lost & found intelligence that matches objects by appearance, context, location, and time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/report/lost"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700 active:scale-[0.98]"
              >
                <PlusCircle className="h-4 w-4" />
                Report Lost Item
              </Link>
              <Link
                href="/search"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
              >
                <Search className="h-4 w-4 text-slate-500" />
                Search Found Items
              </Link>
              <Link
                href="/match/match_airpods_golden"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <span>⚡ Try Live Golden Demo</span>
              </Link>
            </div>

            {/* Quick Live Stats */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-slate-800">{totalItems} Campus Items Logged</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{activeMatches} High-Confidence Matches</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{locationsCount} Active Building Zones</span>
              </div>
            </div>
          </div>

          {/* Interactive Product Visualization Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xl ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                  94%
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">AI Multimodal Match Breakdown</div>
                  <div className="text-xs text-slate-500">Case ID: LST-8841 vs FND-1049 (Main Library)</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                EXCEPTIONAL MATCH
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Lost Side */}
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="uppercase tracking-wider">Reported Lost (4:30 PM)</span>
                  <span className="rounded bg-rose-100 text-rose-700 px-1.5 py-0.5 text-[10px] font-bold">LOST</span>
                </div>
                <div className="aspect-video w-full rounded-xl bg-slate-200 overflow-hidden relative border border-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80"
                    alt="Lost AirPods"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white font-medium">
                    Student Photo
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Apple AirPods Pro Case</div>
                  <div className="text-xs text-slate-600 mt-1">
                    &quot;Lost near library steps with small circular blue sticker.&quot;
                  </div>
                </div>
              </div>

              {/* Match Signals Engine */}
              <div className="space-y-3 px-2">
                <div className="text-center">
                  <div className="text-2xl font-black tracking-tight text-slate-900">94% Confidence</div>
                  <div className="text-[11px] text-slate-500">Multi-Signal Convergence</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 p-2 border border-emerald-100">
                    <span className="font-medium text-emerald-900 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Distinctive Sticker
                    </span>
                    <span className="font-bold text-emerald-700">0.96</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 p-2 border border-emerald-100">
                    <span className="font-medium text-emerald-900 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Color & Finish
                    </span>
                    <span className="font-bold text-emerald-700">0.98</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 p-2 border border-emerald-100">
                    <span className="font-medium text-emerald-900 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Spatial Proximity (140m)
                    </span>
                    <span className="font-bold text-emerald-700">0.92</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 p-2 border border-emerald-100">
                    <span className="font-medium text-emerald-900 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Time Window (35m)
                    </span>
                    <span className="font-bold text-emerald-700">0.94</span>
                  </div>
                </div>
                <div className="pt-1 text-center">
                  <Link
                    href="/match/match_airpods_golden"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Inspect Full Evidence & Journey <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Found Side */}
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="uppercase tracking-wider">Reported Found (5:05 PM)</span>
                  <span className="rounded bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold">FOUND</span>
                </div>
                <div className="aspect-video w-full rounded-xl bg-slate-200 overflow-hidden relative border border-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80"
                    alt="Found AirPods"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white font-medium">
                    Turned-In Photo
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">White Earbuds Case</div>
                  <div className="text-xs text-slate-600 mt-1">
                    &quot;Found on concrete ledge near library entrance with blue sticker.&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Fundamental Problem & How UniTrace Solves It */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">The Problem</span>
            <blockquote className="text-2xl font-bold sm:text-3xl leading-snug">
              &quot;I lost something. How can technology help me recover it even when nobody described it exactly the same way?&quot;
            </blockquote>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Traditional lost-and-found databases fail because a student writes <em>&quot;black laptop sleeve with red sticker near library&quot;</em> while the finder submits <em>&quot;dark computer cover found near Library Block&quot;</em>. Keyword searches produce zero hits, and property remains stranded in security lockers forever.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-8 border-t border-slate-800">
            <div>
              <div className="text-brand-400 font-bold text-lg mb-1">1. Multimodal AI</div>
              <p className="text-xs text-slate-400">
                Analyzes photos + natural language simultaneously to match semantics rather than exact keyword spelling.
              </p>
            </div>
            <div>
              <div className="text-brand-400 font-bold text-lg mb-1">2. Visual Fingerprints</div>
              <p className="text-xs text-slate-400">
                Extracts scratches, stickers, dents, logos, colors, and condition into probabilistic feature graphs.
              </p>
            </div>
            <div>
              <div className="text-brand-400 font-bold text-lg mb-1">3. Probable Journey</div>
              <p className="text-xs text-slate-400">
                Reconstructs spatial-temporal item movement with strict distinction between Observed and AI-Inferred events.
              </p>
            </div>
            <div>
              <div className="text-brand-400 font-bold text-lg mb-1">4. Secure Verification</div>
              <p className="text-xs text-slate-400">
                Zero-knowledge verification questions prevent social engineering and ensure items reach their rightful owners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Enterprise Intelligence</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Engineered for Campus Scale
          </h2>
          <p className="text-sm text-slate-600">
            A production-ready platform built to manage thousands of lost and found assets across complex campus buildings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card space-y-3 hover:border-brand-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Visual Fingerprinting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts high-resolution visual characteristics including logos, brand, color schemes, stickers, surface scuffs, and distinct accessories with confidence scores.
            </p>
          </div>

          <div className="card space-y-3 hover:border-brand-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Probable Item Journey</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Visualizes step-by-step campus timelines. Understand when an item was dropped, who secured it at which desk, and the inferred courier transit path.
            </p>
          </div>

          <div className="card space-y-3 hover:border-brand-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Zero-Knowledge Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Public listings redact sensitive identifying marks. Claimants must answer private challenge questions or provide proofs before staff releases property.
            </p>
          </div>

          <div className="card space-y-3 hover:border-brand-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <GitFork className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Duplicate Cluster Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multiple students reporting the same water bottle or umbrella are automatically clustered into an auditable group, preventing operational clutter.
            </p>
          </div>

          <div className="card space-y-3 hover:border-brand-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Spatial Campus Topography</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Distance decay calculations ensure that matches in the same building or corridor are appropriately prioritized over distant facilities.
            </p>
          </div>

          <div className="card space-y-3 hover:border-brand-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Immutable Audit Trail</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every status modification, claim verification, report merge, and physical handover generates a tamper-evident audit record for campus liability protection.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-600 to-indigo-700 p-8 sm:p-12 text-center text-white shadow-xl space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to recover campus property with AI?</h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base">
            Whether you lost a laptop sleeve in the library or found a set of keys in the courtyard, UniTrace connects the dots.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report/lost"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-md transition hover:bg-brand-50"
            >
              Report a Lost Item
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-brand-300 bg-brand-700/40 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700/70 transition"
            >
              Sign In with Institutional ID
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
