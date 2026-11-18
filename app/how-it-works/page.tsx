import Link from "next/link";
import {
  Camera,
  Sparkles,
  Compass,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  GitFork,
  Search,
  Key,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
          Architecture &amp; Intelligence Workflow
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          How UniTrace Works
        </h1>
        <p className="text-sm text-slate-600">
          From uncurated mobile snapshots to verified security release: a modern zero-knowledge recovery journey.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Step 01</span>
            <h2 className="text-xl font-bold text-slate-900">Multimodal Intake &amp; Visual Fingerprinting</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              When an item is reported, users describe it in their own words and upload a photo. The AI Vision Engine extracts a structured visual fingerprint containing primary/secondary color schemes, brand emblems, custom stickers, surface scuffs, and unique imperfections with individual confidence ratings.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-brand-600" /> Extracted Fingerprint
            </div>
            <div className="text-[11px] text-slate-600 space-y-1 font-mono bg-white p-2.5 rounded-lg border border-slate-100">
              <div>brand: &quot;Apple&quot; (0.96)</div>
              <div>color: &quot;White&quot; (0.99)</div>
              <div>stickers: &quot;Blue round NASA&quot; (0.92)</div>
              <div>scratches: &quot;Hinge scuff&quot; (0.85)</div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Step 02</span>
            <h2 className="text-xl font-bold text-slate-900">Multi-Signal Weighted Convergence</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              UniTrace does not rely solely on simple keyword search or raw image embeddings. It calculates a weighted composite match combining visual similarity (30%), semantic context (25%), structured attributes (20%), spatial campus proximity decay (15%), and temporal window decay (10%).
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-2 text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase block">Composite Match</span>
            <div className="text-3xl font-black text-emerald-700">94%</div>
            <span className="text-[11px] text-emerald-600 font-medium block">
              Exceptional Multi-Signal Convergence
            </span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Step 03</span>
            <h2 className="text-xl font-bold text-slate-900">Probable Item Journey Reconstruction</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Items frequently travel before reaching a security office. UniTrace plots sightings chronologically along a campus topography map, distinctly categorizing each checkpoint as verified human reports (<strong>OBSERVED</strong>) versus algorithmically inferred walkway corridors (<strong>AI-INFERRED</strong>).
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block">
              Timeline Trajectory
            </span>
            <div className="space-y-1 text-[11px]">
              <div>1. Library Steps (Observed)</div>
              <div>2. Circulation Desk (Observed)</div>
              <div className="text-purple-400">3. Block 32 Walkway (Inferred)</div>
              <div className="text-emerald-400">4. Security Depot (Observed)</div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Step 04</span>
            <h2 className="text-xl font-bold text-slate-900">Zero-Knowledge Verification &amp; Safe Release</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI correlation is never treated as legal proof of ownership. Claimants must privately describe hidden markings, serial numbers, or stickers that are omitted from public listings. Once staff approves the claim, a secure PIN is issued for physical in-person handover at the campus security desk.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-900 text-white p-4 text-center space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 block">
              Handover Release PIN
            </span>
            <div className="text-2xl font-mono font-black text-emerald-400 tracking-widest">RC-8841</div>
            <span className="text-[10px] text-slate-300 block">Verified with Student ID Card</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/report/lost" className="btn-primary py-3 px-8">
          Report a Misplaced Belonging
        </Link>
      </div>
    </main>
  );
}
