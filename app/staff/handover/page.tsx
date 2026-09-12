"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  IdCard,
  User,
  ArrowRight,
} from "lucide-react";

function HandoverDeskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClaimId = searchParams.get("claimId") || "claim_airpods_golden";
  const initialPin = searchParams.get("pin") || "RC-8841";

  const [claimId, setClaimId] = useState(initialClaimId);
  const [handoverCode, setHandoverCode] = useState(initialPin);
  const [idMethod, setIdMethod] = useState("STUDENT_ID_CARD");
  const [signature, setSignature] = useState("Alex Sharma (STU-2024-8841)");
  const [notes, setNotes] = useState("Student presented valid University ID card. Property released.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleHandoverSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/claims/${claimId}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          handoverCode,
          handoverLocationId: "loc_security_desk",
          idVerificationMethod: idMethod,
          claimantSignature: signature,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error?.message || "Handover validation failed");
      }
    } catch {
      setError("Network error executing handover");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center space-y-4 border-emerald-200 bg-emerald-50/50">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Property Released Successfully
          </span>
          <h2 className="text-2xl font-black text-slate-900">ITEM STATUS: RECOVERED</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The physical handover has been verified and permanently recorded into the campus audit trail. The case is now officially resolved.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <Link href="/staff/claims" className="btn-secondary">
            Return to Claims Queue
          </Link>
          <Link href="/staff/dashboard" className="btn-primary">
            Staff Operations Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Physical Release Desk</span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Security Depot</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            In-Person Handover Station
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validate claimant PIN and authenticate physical ID card before releasing locked property.
          </p>
        </div>

        <Link href="/staff/claims" className="btn-secondary text-xs">
          View All Claims
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <form onSubmit={handleHandoverSubmit} className="card p-6 space-y-5 bg-white border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label" htmlFor="claimId">
              Claim ID
            </label>
            <input
              id="claimId"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              required
              className="input-field font-mono"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="handoverCode">
              Claimant 6-Character Release PIN *
            </label>
            <input
              id="handoverCode"
              value={handoverCode}
              onChange={(e) => setHandoverCode(e.target.value.toUpperCase())}
              required
              placeholder="e.g. RC-8841"
              className="input-field font-mono text-lg font-bold tracking-widest text-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label" htmlFor="idMethod">
              ID Card Verification Method *
            </label>
            <select
              id="idMethod"
              value={idMethod}
              onChange={(e) => setIdMethod(e.target.value)}
              className="input-field"
            >
              <option value="STUDENT_ID_CARD">Apex Student ID Card</option>
              <option value="GOVT_ID">Government Issued Photo ID</option>
              <option value="STAFF_ATTESTATION">Staff Faculty Attestation</option>
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="signature">
              Claimant Signature / Attestation Name *
            </label>
            <input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="notes">
            Security Desk Release Log Notes
          </label>
          <input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/staff/claims" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary bg-emerald-600 hover:bg-emerald-700 py-3 px-8">
            {loading ? "Verifying PIN & Releasing..." : "Authorize Release & Mark Recovered"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function StaffHandoverStationPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Suspense fallback={<div className="card py-20 text-center text-slate-400 text-sm">Loading handover station...</div>}>
        <HandoverDeskContent />
      </Suspense>
    </main>
  );
}
