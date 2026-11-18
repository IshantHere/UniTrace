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
  const [signature, setSignature] = useState("Ishant Singh (STU-2024-8841)");
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
      <div className="card p-8 sm:p-10 text-center space-y-6 border-[#DADAD6] bg-white rounded">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded border border-[#25845A]/30 bg-[#25845A]/10 text-[#25845A]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <span className="badge-verified font-mono text-[10px]">
            RELEASE AUTHENTICATED
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#171717] pt-1">
            ITEM STATUS: RECOVERED
          </h2>
          <p className="text-xs text-[#777777] max-w-md mx-auto leading-relaxed">
            The physical property handover has been validated and permanently committed to the immutable campus audit ledger. The lost report case is now closed.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link href="/staff/claims" className="btn-secondary text-xs">
            Return to Claims Queue
          </Link>
          <Link href="/staff/dashboard" className="btn-primary text-xs">
            Staff Operations Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [HANDOVER-DESK // PHYSICAL-RELEASE]
            </span>
            <span className="badge-verified text-[10px]">
              CENTRAL SECURITY DEPOT
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            In-Person Handover Station
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Validate claimant 6-character release PIN and authenticate physical ID card credentials before unlocking custody.
          </p>
        </div>

        <Link href="/staff/claims" className="btn-secondary text-xs self-start sm:self-auto">
          View All Claims
        </Link>
      </div>

      {error && (
        <div className="rounded border border-[#DC2626]/30 bg-[#DC2626]/5 p-3.5 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Handover Form */}
      <form onSubmit={handleHandoverSubmit} className="card p-6 sm:p-7 space-y-6 bg-white border-[#DADAD6] rounded">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label" htmlFor="claimId">
              Claim ID Reference *
            </label>
            <input
              id="claimId"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              required
              className="input-field font-mono text-xs"
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
              className="input-field font-mono text-base font-bold tracking-widest text-[#25845A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label" htmlFor="idMethod">
              ID Card Credential Verification *
            </label>
            <select
              id="idMethod"
              value={idMethod}
              onChange={(e) => setIdMethod(e.target.value)}
              className="input-field text-xs"
            >
              <option value="STUDENT_ID_CARD">Newton Student ID Card</option>
              <option value="GOVT_ID">Government Photo ID (Passport / License)</option>
              <option value="STAFF_ATTESTATION">Campus Staff Attestation</option>
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="signature">
              Claimant Attestation / Signature Name *
            </label>
            <input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              required
              className="input-field text-xs"
            />
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="notes">
            Security Depot Physical Release Notes
          </label>
          <input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field text-xs"
          />
        </div>

        <div className="pt-4 border-t border-[#DADAD6] flex items-center justify-between">
          <Link href="/staff/claims" className="btn-secondary text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
          >
            {loading ? "Authenticating PIN & Releasing..." : "Authorize Release & Mark Recovered"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function StaffHandoverStationPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="card p-12 text-center text-[#777777] text-xs font-mono border-[#DADAD6] bg-white">[INITIALIZING HANDOVER TERMINAL...]</div>}>
        <HandoverDeskContent />
      </Suspense>
    </main>
  );
}
