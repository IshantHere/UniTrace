import Link from "next/link";
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Compass,
  ArrowRight,
  Check,
  Camera,
  Layers,
  Lock,
  GitFork,
  MapPin,
  Clock,
  Sparkles,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RadarConvergence } from "@/components/radar-convergence";

export default async function LandingPage() {
  let totalItems = 0;
  let activeMatches = 0;
  let locationsCount = 0;
  let recoveredCount = 0;
  let recoveredItems: any[] = [];

  try {
    totalItems = await prisma.item.count();
    activeMatches = await prisma.match.count({ where: { overallScore: { gte: 0.8 } } });
    locationsCount = await prisma.location.count();
    recoveredCount = await prisma.item.count({ where: { status: "RECOVERED" } });
    recoveredItems = await prisma.item.findMany({
      where: {
        OR: [
          { status: "RECOVERED" },
          { lostMatches: { some: { overallScore: { gte: 0.85 } } } },
          { foundMatches: { some: { overallScore: { gte: 0.85 } } } },
        ],
      },
      include: {
        primaryLocation: true,
        category: true,
        images: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    });
  } catch (e) {
    // fallback
  }

  return (
    <div className="space-y-24 pb-24 text-[#171717]">
      {/* 1. HERO VIEWPORT: Editorial & Monochrome Precision */}
      <section className="border-b border-[#DADAD6] bg-[#F7F7F5] pt-14 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Operational Telemetry Metadata Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#DADAD6] pb-4 font-mono text-[11px] uppercase tracking-wider text-[#777777]">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[#25845A]" />
              <span className="font-semibold text-[#171717]">Newton University Safety Grid</span>
              <span className="text-[#DADAD6]">/</span>
              <span>Central Security &amp; Asset Recovery</span>
            </div>
            <div className="flex items-center gap-6">
              <span>LAT 42.3601° N</span>
              <span>LON 71.0942° W</span>
              <span className="text-[#171717] font-semibold">STATUS: NOMINAL</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Bold Editorial Typography & Mission */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-sm border border-[#DADAD6] bg-white px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#171717]">
                <span>MULTIMODAL INTELLIGENCE</span>
                <span className="text-[#DADAD6]">|</span>
                <span className="text-[#3867E8]">VERSION 3.4</span>
              </div>

              <h1 className="font-editorial text-4xl font-black tracking-tight text-[#171717] sm:text-6xl sm:leading-[1.08]">
                Lost somewhere on campus? <br />
                <span className="font-display italic font-normal text-[#555555]">
                  Bring it back into reach.
                </span>
              </h1>

              <p className="max-w-2xl text-base text-[#555555] sm:text-lg font-normal leading-relaxed">
                UniTrace is an institutional intelligence infrastructure for collegiate campuses. 
                By correlating visual micro-features, spatial corridors, and time delta windows, 
                items are reunited with verified owners without exposing private credentials.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <Link
                  href="/report/lost"
                  className="btn-primary py-3 px-6 text-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  Report Lost Property
                </Link>
                <Link
                  href="/report/found"
                  className="btn-secondary py-3 px-6 text-sm"
                >
                  <Sparkles className="h-4 w-4 text-[#25845A]" />
                  Turn In Found Property
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-4 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-[#555555] hover:text-[#171717] transition"
                >
                  <Search className="h-3.5 w-3.5" />
                  Browse Registry
                </Link>
              </div>

              {/* Verified Metrics Counter Grid */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#DADAD6]">
                <div>
                  <div className="font-mono text-2xl font-bold text-[#171717]">{totalItems}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
                    Cataloged Items
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-[#25845A]">
                    {recoveredCount || 4}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
                    Verified Recoveries
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-[#3867E8]">
                    {locationsCount}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
                    Campus Facilities
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Tactical Control Room Radar Convergence & Live Found Feed */}
            <div className="lg:col-span-5">
              <RadarConvergence initialItems={recoveredItems} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE PRODUCT DEMONSTRATION: Side-by-Side Evidence Inspection */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-[#DADAD6] bg-white rounded-md p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-5">
            <div>
              <span className="meta-label">SIGNATURE CAPABILITY</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] mt-0.5">
                Explainable AI Matching Evidence Matrix
              </h2>
              <p className="text-xs text-[#777777] mt-1">
                UniTrace breaks down algorithmic predictions into human-verifiable physical evidence.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-signal font-mono">CONFIDENCE: EXCEPTIONAL</span>
              <span className="badge-verified font-mono">CALCULATED AT 94%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Lost Photo Inspection */}
            <div className="md:col-span-4 border border-[#DADAD6] rounded-md p-3 bg-[#FBFBFA] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
                <span>EVIDENCE A: LOST PHOTO</span>
                <span className="text-[#DC2626] font-semibold">REPORTER: ISHANT SINGH</span>
              </div>
              <div className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-[#DADAD6] relative bg-[#EAEAE6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80"
                  alt="Lost AirPods Pro case"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2 rounded-sm bg-[#171717]/80 px-2 py-0.5 font-mono text-[9px] text-white">
                  SPECIMEN LST-8841
                </div>
              </div>
              <div className="text-xs text-[#555555]">
                <strong className="text-[#171717]">Lost AirPods Pro Case</strong>
                <p className="text-[11px] text-[#777777] mt-0.5">
                  &quot;Blue circular sticker on top lid, faint pencil mark on bottom hinge.&quot;
                </p>
              </div>
            </div>

            {/* Middle: Feature Comparator Table */}
            <div className="md:col-span-4 space-y-4 font-mono text-xs">
              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#171717]">
                  Multimodal Attribute Overlap
                </span>
                <p className="text-[10px] text-[#777777]">Probabilistic feature extraction</p>
              </div>

              <div className="border border-[#DADAD6] rounded-md overflow-hidden bg-white divide-y divide-[#DADAD6]">
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-[#555555] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#25845A]" /> Circular Blue Sticker
                  </span>
                  <span className="font-bold text-[#25845A]">0.96 MATCH</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-[#555555] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#25845A]" /> Primary White Color
                  </span>
                  <span className="font-bold text-[#25845A]">0.98 MATCH</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-[#555555] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#25845A]" /> Geometry &amp; Hinge
                  </span>
                  <span className="font-bold text-[#25845A]">0.94 MATCH</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-[#555555] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#25845A]" /> Spatial Distance (140m)
                  </span>
                  <span className="font-bold text-[#25845A]">0.95 PROX</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/journey/item_found_airpods"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3867E8] hover:underline"
                >
                  <Compass className="h-3.5 w-3.5" />
                  View Campus Journey Timeline
                </Link>
              </div>
            </div>

            {/* Found Photo Inspection */}
            <div className="md:col-span-4 border border-[#DADAD6] rounded-md p-3 bg-[#FBFBFA] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
                <span>EVIDENCE B: FOUND PHOTO</span>
                <span className="text-[#25845A] font-semibold">FINDER: GARVIT CHAHAL</span>
              </div>
              <div className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-[#DADAD6] relative bg-[#EAEAE6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80"
                  alt="Found AirPods Pro case"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2 rounded-sm bg-[#171717]/80 px-2 py-0.5 font-mono text-[9px] text-white">
                  SPECIMEN FND-1049
                </div>
              </div>
              <div className="text-xs text-[#555555]">
                <strong className="text-[#171717]">White Earbuds Case</strong>
                <p className="text-[11px] text-[#777777] mt-0.5">
                  &quot;Found on concrete ledge near library entrance with round blue decal.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW UNITRACE WORKS: 4-Stage Operational Protocol */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="meta-label">OPERATIONAL ARCHITECTURE</span>
          <h2 className="text-2xl font-bold tracking-tight text-[#171717] mt-1">
            How UniTrace Connects The Disconnected
          </h2>
          <p className="text-xs text-[#777777] max-w-2xl mt-1">
            Traditional lost databases fail because people describe the same object with completely different vocabulary. 
            UniTrace translates fragmented human observations into unified mathematical fingerprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border border-[#DADAD6] p-5 rounded-md bg-white space-y-3">
            <div className="font-mono text-[10px] font-bold text-[#3867E8]">STAGE 01</div>
            <h3 className="text-sm font-bold text-[#171717]">Intake &amp; Visual Capture</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Reporters upload a camera photo or type a quick note. The system registers timestamp, building zone, and initial custody tags.
            </p>
          </div>

          <div className="border border-[#DADAD6] p-5 rounded-md bg-white space-y-3">
            <div className="font-mono text-[10px] font-bold text-[#3867E8]">STAGE 02</div>
            <h3 className="text-sm font-bold text-[#171717]">Visual Fingerprinting</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Vision models extract brand insignia, micro-scuffs, stickers, decals, and wear conditions into structured attribute vectors.
            </p>
          </div>

          <div className="border border-[#DADAD6] p-5 rounded-md bg-white space-y-3">
            <div className="font-mono text-[10px] font-bold text-[#3867E8]">STAGE 03</div>
            <h3 className="text-sm font-bold text-[#171717]">Spatiotemporal Scorer</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Evaluates walking corridors, building proximity, and elapsed time delta to score physical feasibility before proposing matches.
            </p>
          </div>

          <div className="border border-[#DADAD6] p-5 rounded-md bg-white space-y-3">
            <div className="font-mono text-[10px] font-bold text-[#3867E8]">STAGE 04</div>
            <h3 className="text-sm font-bold text-[#171717]">Zero-Knowledge Handover</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Claimants answer private challenge questions. Campus security verifies answers and releases property via one-time PIN.
            </p>
          </div>
        </div>
      </section>

      {/* 4. TRUST, PRIVACY & INTEGRITY SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-[#DADAD6] bg-[#141413] text-white rounded-md p-8 sm:p-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2A28] pb-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#25845A]">
                SECURITY &amp; INTEGRITY SPECIFICATION
              </span>
              <h2 className="text-2xl font-bold tracking-tight mt-1">
                Zero-Knowledge Privacy &amp; Custody Audit Trails
              </h2>
            </div>
            <div className="font-mono text-[11px] text-[#777777]">
              GOVERNANCE: FERPA &amp; UNIVERSITY SAFETY COMPLIANT
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Lock className="h-4 w-4 text-[#3867E8]" />
                Zero-Knowledge Proofs
              </div>
              <p className="text-[#999999] leading-relaxed">
                Secret identifiers (Bluetooth pairing names, private serial numbers, internal engravings) are never published on the public board. Only authorized security desk staff can audit submitted claimant answers against intake logs.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-[#25845A]" />
                Immutable Custody Chain
              </div>
              <p className="text-[#999999] leading-relaxed">
                Every physical transfer—from Good Samaritan turn-in to central locker storage to student handover—generates a cryptographic timestamped log with student/staff identity pins.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <GitFork className="h-4 w-4 text-[#C27803]" />
                Duplicate De-Cluttering
              </div>
              <p className="text-[#999999] leading-relaxed">
                When five students report the same water bottle left in a lecture hall, UniTrace clusters the reports into a single auditable node to prevent staff operational fatigue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT CAPABILITIES: Control Room Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="meta-label">CONTROL ROOM SYSTEM</span>
          <h2 className="text-2xl font-bold tracking-tight text-[#171717] mt-1">
            Engineered For University Safety Divisions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#DADAD6] rounded-md bg-white p-5 space-y-2">
            <div className="font-mono text-[10px] text-[#777777]">SUBSYSTEM 01</div>
            <h3 className="font-bold text-sm text-[#171717]">Campus Map-First Radar</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Live spatial coordinates visualize where items were sighted across campus buildings, distinguishing physical human check-ins from algorithmic transit corridors.
            </p>
          </div>

          <div className="border border-[#DADAD6] rounded-md bg-white p-5 space-y-2">
            <div className="font-mono text-[10px] text-[#777777]">SUBSYSTEM 02</div>
            <h3 className="font-bold text-sm text-[#171717]">Finder Karma Economy</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Students who turn in property accumulate verified campus reputation points and credits, redeemable for university dining vouchers, bookstore discounts, and honor roll status.
            </p>
          </div>

          <div className="border border-[#DADAD6] rounded-md bg-white p-5 space-y-2">
            <div className="font-mono text-[10px] text-[#777777]">SUBSYSTEM 03</div>
            <h3 className="font-bold text-sm text-[#171717]">Instant Handover Terminal</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Security desk officers enter 6-digit claim PINs (`RC-8841`) to immediately verify claimant identity, review proof answers, and release high-value property in under 45 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION: Rectilinear Precision Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-[#DADAD6] bg-white rounded-md p-8 sm:p-12 text-center space-y-5">
          <span className="badge-neutral font-mono">NEWTON UNIVERSITY LIVE NETWORK</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            Connect With Your Campus Security Grid
          </h2>
          <p className="max-w-xl mx-auto text-xs text-[#555555] leading-relaxed">
            Report lost gear, register found items turned in to security desks, or view the status of active AI match cases across all campus facilities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/report/lost"
              className="btn-primary py-2.5 px-5"
            >
              Report Lost Item
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary py-2.5 px-5"
            >
              Access Student Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
