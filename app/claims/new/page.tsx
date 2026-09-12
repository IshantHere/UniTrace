"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Camera,
} from "lucide-react";

function ClaimFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId") || "item_found_airpods";
  const lostItemId = searchParams.get("lostItemId") || undefined;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: "",
    q2: "",
  });

  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.item) {
          setItem(d.data.item);
        } else {
          setError("Target item not found");
        }
      })
      .catch(() => setError("Failed to load item"))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const verificationAnswers = [
      {
        question: "Describe any distinctive markings, stickers, engravings, or color variations on the item.",
        answer: answers.q1,
      },
      {
        question: "Describe any visible scratches, dents, or specific signs of wear.",
        answer: answers.q2,
      },
    ];

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          lostItemId,
          verificationAnswers,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/claims");
      } else {
        if (res.status === 401) {
          router.push("/login");
        } else {
          setError(json.error?.message || "Failed to submit ownership claim");
        }
      }
    } catch {
      setError("Network error submitting claim");
    } finally {
      setSubmitting(false);
    }
  };

  const autofillAlexAirPodsClaim = () => {
    setAnswers({
      q1: "A small circular blue NASA logo sticker on the top cover, approximately 1.5cm wide.",
      q2: "A minor gray scuff near the lower back hinge from dropping it on the library steps.",
    });
    setNotes("Bluetooth name connects as 'Alex AirDrop'.");
  };

  if (loading) {
    return <div className="card py-20 text-center text-slate-400 text-sm">Loading verification questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Zero-Knowledge Security</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Ownership Verification Claim
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Answer private challenge questions to verify genuine ownership before property is released.
          </p>
        </div>

        <button
          type="button"
          onClick={autofillAlexAirPodsClaim}
          className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
        >
          ⚡ Autofill Alex&apos;s Verification
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {item && (
        <div className="card p-4 bg-slate-50 border-slate-200 flex gap-4 items-center">
          <div className="h-16 w-16 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb"}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Claiming Item</span>
            <div className="font-bold text-sm text-slate-900 truncate">{item.title}</div>
            <div className="text-xs text-slate-500">
              Discovered at {item.primaryLocation?.name} • Category: {item.category?.name}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-amber-700" />
              Zero-Knowledge Verification Rules
            </div>
            <p className="text-slate-600">
              Public listings omit private details. Officers will cross-reference your answers against the physical item sealed in security storage. Be as detailed and specific as possible.
            </p>
          </div>

          <div>
            <label className="input-label" htmlFor="q1">
              Challenge Question 1: Distinctive Markings &amp; Stickers *
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Describe any stickers, protective skins, engraved text, or custom decorations on the exterior.
            </p>
            <textarea
              id="q1"
              value={answers.q1}
              onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
              required
              minLength={5}
              rows={3}
              placeholder="e.g. Circular blue NASA sticker on the top cover, approximately 1.5cm wide..."
              className="input-field min-h-20"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="q2">
              Challenge Question 2: Scratches, Flaws &amp; Imperfections *
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Describe any distinctive scratches, scuffs, cracks, or surface marks.
            </p>
            <textarea
              id="q2"
              value={answers.q2}
              onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
              required
              minLength={5}
              rows={3}
              placeholder="e.g. Minor gray scuff mark near the lower back hinge from concrete drop..."
              className="input-field min-h-20"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="notes">
              Additional Supporting Notes (Optional)
            </label>
            <input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bluetooth pairing name is 'Alex AirDrop', purchase date August 2024"
              className="input-field"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary py-3 px-8">
            {submitting ? "Submitting for Verification..." : "Submit Verification Claim"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewClaimPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Suspense fallback={<div className="card py-20 text-center text-slate-400 text-sm">Loading verification form...</div>}>
        <ClaimFormContent />
      </Suspense>
    </main>
  );
}
