import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, Users, Building2, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
          [GOVERNANCE // TRUST-FRAMEWORK]
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#171717]">
          Security, Privacy &amp; Institutional Governance
        </h1>
        <p className="text-xs text-[#777777] leading-relaxed max-w-xl mx-auto">
          UniTrace is engineered from the ground up for university environments to protect student privacy, enforce zero-knowledge authentication, and prevent fraudulent property release.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-3 border-[#DADAD6] bg-white rounded">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#25845A]/30 bg-[#25845A]/10 text-[#25845A]">
            <EyeOff className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-[#171717]">Redaction of Sensitive Identifiers</h2>
          <p className="text-xs text-[#777777] leading-relaxed">
            Public listings never display serial numbers, engraving details, or private contents of bags and wallets. Only high-level categorical attributes and general physical features are visible to eliminate social engineering vulnerabilities.
          </p>
        </div>

        <div className="card p-6 space-y-3 border-[#DADAD6] bg-white rounded">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#3867E8]/30 bg-[#3867E8]/10 text-[#3867E8]">
            <Lock className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-[#171717]">Zero-Knowledge Verification Protocol</h2>
          <p className="text-xs text-[#777777] leading-relaxed">
            Before receiving high-value assets, claimants must answer challenge questions privately without seeing expected answers. Campus security officers review proofs in an authenticated operations terminal before releasing property.
          </p>
        </div>

        <div className="card p-6 space-y-3 border-[#DADAD6] bg-white rounded">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#DADAD6] bg-[#F7F7F5] text-[#171717]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-[#171717]">Immutable Audit Trail</h2>
          <p className="text-xs text-[#777777] leading-relaxed">
            Every status change, claim approval, duplicate cluster merge, and physical handover generates a tamper-evident audit record with actor ID, timestamp, and metadata delta for institutional compliance.
          </p>
        </div>

        <div className="card p-6 space-y-3 border-[#DADAD6] bg-white rounded">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#DADAD6] bg-[#F7F7F5] text-[#171717]">
            <Building2 className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-[#171717]">Institutional Multi-Tenant Partitioning</h2>
          <p className="text-xs text-[#777777] leading-relaxed">
            All records, geospatial zones, and student accounts are strictly partitioned to their respective institution and campus boundary, preventing unauthorized cross-tenant data exposure.
          </p>
        </div>
      </div>

      <div className="card p-8 sm:p-10 border-[#171717] bg-[#171717] text-white space-y-4 rounded">
        <div className="flex items-center gap-2">
          <span className="badge-verified text-[10px]">ACTIVE INSTITUTIONAL DEPLOYMENT</span>
        </div>
        <h2 className="font-serif text-2xl font-normal tracking-tight text-white">About the Newton University Deployment</h2>
        <p className="text-xs text-white/80 leading-relaxed max-w-2xl">
          UniTrace is deployed as the official lost-and-found intelligence platform for <strong>Newton University</strong>, serving over 25,000 students, faculty, and administrative staff across primary academic facilities. Multimodal AI correlation is powered by Google Gemini vision intelligence.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn-primary text-xs py-2 px-4 bg-white text-[#171717] hover:bg-white/90">
            Explore Dashboard
          </Link>
          <Link href="/how-it-works" className="btn-secondary text-xs py-2 px-4 border-white/20 bg-white/10 text-white hover:bg-white/20">
            Technical Architecture
          </Link>
        </div>
      </div>
    </main>
  );
}
