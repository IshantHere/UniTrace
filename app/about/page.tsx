import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, Users, Building2, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
          Trust &amp; Institutional Governance
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Security, Privacy &amp; Campus Trust
        </h1>
        <p className="text-sm text-slate-600">
          UniTrace was designed from day one to protect student privacy and prevent fraudulent property claims.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <EyeOff className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Redaction of Sensitive Identifiers</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Public listings never display serial numbers, engraving details, or private contents of bags and wallets. Only high-level attributes (category, general color, location) are visible to prevent social engineering.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Zero-Knowledge Verification Protocol</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Before receiving high-value assets, claimants must answer challenge questions privately without seeing answers. Security officers review responses in an authenticated backoffice portal.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Immutable Audit Trail</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every status change, claim approval, report merge, and physical release generates a tamper-evident audit record with actor ID, timestamp, and IP address for full institutional compliance.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Multi-Tenant SaaS Isolation</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All records, locations, and user accounts are strictly scoped to their respective institution and campus boundary, preventing unauthorized cross-tenant data access.
          </p>
        </div>
      </div>

      <div className="card p-8 bg-slate-900 text-white space-y-4">
        <h2 className="text-xl font-bold">About the Pilot Deployment</h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          UniTrace is actively running as an institutional pilot for <strong>Apex University</strong>, serving over 25,000 students and faculty across 6 primary academic facilities. All AI extraction is powered by Google Gemini multimodal intelligence.
        </p>
        <div className="pt-2 flex gap-4">
          <Link href="/dashboard" className="btn-primary">
            Explore Dashboard
          </Link>
          <Link href="/how-it-works" className="btn-secondary">
            View Technical Workflow
          </Link>
        </div>
      </div>
    </main>
  );
}
