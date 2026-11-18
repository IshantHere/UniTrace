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
  MapPin,
} from "lucide-react";
import { getItemImageUrl } from "@/lib/images";

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

  const autofillIshantAirPodsClaim = () => {
    setAnswers({
      q1: "A small circular blue NASA logo sticker on the top cover, approximately 1.5cm wide.",
      q2: "A minor gray scuff near the lower back hinge from dropping it on the library steps.",
    });
    setNotes("Bluetooth name connects as 'Ishant AirDrop'.");
  };

  if (loading) {
    return (
      <div className="card p-12 text-center text-[#777777] text-xs font-mono border-[#DADAD6] bg-white">
        [INITIALIZING ZERO-KNOWLEDGE CHALLENGE GATEWAY...]
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Protocol Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [VERIFICATION-GATE // ZERO-KNOWLEDGE]
            </span>
            <span className="badge-signal text-[10px]">
              OWNERSHIP ATTESTATION
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Ownership Verification Claim
          </h1>
          <p className="text-xs text-[#777777] mt-1 max-w-xl">
            To prevent fraudulent handovers, public listings redact identifying nuances. Provide verifiable challenge proofs matching the physical specimen stored at Central Security.
          </p>
        </div>

        <button
          type="button"
          onClick={autofillIshantAirPodsClaim}
          className="self-start sm:self-auto border border-[#DADAD6] bg-white px-3 py-1.5 text-xs font-mono font-medium text-[#171717] hover:border-[#171717] transition rounded"
        >
          ⚡ Autofill Ishant&apos;s Verification
        </button>
      </div>

      {error && (
        <div className="rounded border border-[#DC2626]/30 bg-[#DC2626]/5 p-3.5 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Specimen Reference */}
      {item && (
        <div className="card p-4 sm:p-5 bg-white border-[#DADAD6] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-16 w-16 rounded overflow-hidden border border-[#DADAD6] bg-[#F7F7F5] flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getItemImageUrl(item)}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-[#777777]">TARGET SPECIMEN</span>
                <span className="badge-neutral text-[9px]">IN SECURE DEPOT</span>
              </div>
              <div className="font-semibold text-sm text-[#171717] truncate">{item.title}</div>
              <div className="text-xs text-[#777777] flex items-center gap-2">
                <span>{item.primaryLocation?.name}</span>
                <span>•</span>
                <span>Category: {item.category?.name}</span>
              </div>
            </div>
          </div>

          <div className="font-mono text-[11px] text-[#777777] border-t sm:border-t-0 sm:border-l border-[#DADAD6] pt-2 sm:pt-0 sm:pl-4">
            SPECIMEN #{item.id.slice(-8)}
          </div>
        </div>
      )}

      {/* Verification Challenge Form */}
      <form onSubmit={handleSubmit} className="card p-6 sm:p-7 space-y-6 bg-white border-[#DADAD6]">
        {/* Zero-Knowledge Protocol Notice */}
        <div className="border border-[#3867E8]/20 bg-[#3867E8]/5 p-4 rounded space-y-1.5 text-xs">
          <div className="font-semibold text-[#171717] flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#3867E8]" />
            Zero-Knowledge Verification Rules
          </div>
          <p className="text-[#777777] leading-relaxed">
            Public listings intentionally omit distinguishing characteristics such as decals, scratches, engravings, and pairing names. Officer Vijay Kumar will cross-reference your submitted challenge answers directly against the physical item sealed in security storage.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="input-label" htmlFor="q1">
              Challenge Proof 01: Distinctive Markings &amp; Decals *
            </label>
            <p className="text-[11px] text-[#777777] mb-1.5">
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
              className="input-field min-h-[80px]"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="q2">
              Challenge Proof 02: Scratches, Flaws &amp; Wear Patterns *
            </label>
            <p className="text-[11px] text-[#777777] mb-1.5">
              Describe any distinctive scratches, scuffs, cracks, or surface marks.
            </p>
            <textarea
              id="q2"
              value={answers.q2}
              onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
              required
              minLength={5}
              rows={3}
              placeholder="e.g. Minor gray scuff mark near the lower back hinge from dropping on concrete..."
              className="input-field min-h-[80px]"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="notes">
              Corroborating Telemetry / Device Identifier (Optional)
            </label>
            <p className="text-[11px] text-[#777777] mb-1.5">
              Provide verifiable digital handles (e.g. Bluetooth pairing name, serial number, or approximate acquisition date).
            </p>
            <input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bluetooth broadcast name 'Ishant AirDrop', purchase date August 2024"
              className="input-field"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#DADAD6] flex items-center justify-between">
          <Link href="/dashboard" className="btn-secondary text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
          >
            {submitting ? "Transmitting Challenge Proofs..." : "Submit Verification Claim"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewClaimPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="card p-12 text-center text-[#777777] text-xs font-mono border-[#DADAD6] bg-white">[LOADING VERIFICATION INTERFACE...]</div>}>
        <ClaimFormContent />
      </Suspense>
    </main>
  );
}
