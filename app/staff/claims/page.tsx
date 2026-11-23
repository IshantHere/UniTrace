"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Lock,
  FileText,
  User,
  AlertCircle,
  Key,
  Smartphone,
  Send,
  Copy,
  Check,
  MessageSquare,
  Share2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { getItemImageUrl } from "@/lib/images";

export default function StaffClaimsQueuePage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [successPin, setSuccessPin] = useState<{
    claimId: string;
    pin: string;
    itemTitle: string;
    claimantName: string;
    whatsappPhone?: string | null;
    whatsappConfigured: boolean;
    directLink?: string;
    telegramConfigured?: boolean;
    telegramLink?: string;
  } | null>(null);

  const loadClaims = async () => {
    try {
      const res = await fetch("/api/claims", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.claims)) {
        setClaims(json.data.claims);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleApprove = async (claimId: string) => {
    setActionLoading(claimId);
    setSuccessPin(null);

    const matchClaim = claims.find((c) => c.id === claimId);

    try {
      const res = await fetch(`/api/claims/${claimId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE",
          reviewerNotes: reviewNotes[claimId] || "Challenge answers match physical property in central security storage.",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessPin({
          claimId,
          pin: json.data.handoverCode,
          itemTitle: matchClaim?.item?.title || "Item",
          claimantName: matchClaim?.claimant?.name || "Claimant",
          whatsappPhone: json.data.whatsappAlert?.phone,
          whatsappConfigured: !!json.data.whatsappAlert?.configured,
          directLink: json.data.whatsappAlert?.directLink,
          telegramConfigured: !!json.data.telegramAlert?.configured,
          telegramLink: json.data.telegramAlert?.directLink,
        });
        await loadClaims();
      } else {
        alert(json.error?.message || "Failed to approve claim");
      }
    } catch {
      alert("Network error approving claim");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (claimId: string) => {
    const reason = prompt("Enter rejection reason for claimant:", "Answers did not match item in storage.");
    if (!reason) return;

    setActionLoading(claimId);
    try {
      const res = await fetch(`/api/claims/${claimId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason: reason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        await loadClaims();
      } else {
        alert(json.error?.message || "Failed to reject claim");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [STAFF-OPS // CLAIMS-QUEUE]
            </span>
            <span className="badge-signal text-[10px]">
              SECURITY AUDIT
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Ownership Verification Queue
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Cross-reference claimant zero-knowledge proofs directly against physical specimen inspection notes before authorizing release.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/staff/handover" className="btn-primary text-xs flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            <span>Go to Handover Desk</span>
          </Link>
          <Link href="/staff/dashboard" className="btn-secondary text-xs">
            Staff Overview
          </Link>
        </div>
      </div>

      {/* Success Notification Banner with PIN & Multi-Channel Links */}
      {successPin && (
        <div className="border border-[#171717] bg-[#171717] text-white p-6 rounded space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/15 pb-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#25845A] text-white font-mono font-bold text-xs">
                ✓
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#25845A]">
                OWNERSHIP VERIFIED — HANDOVER PIN GENERATED
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-mono text-[10px] uppercase text-white/60">
                DISPATCHED TO MOBILE ALERTS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="border border-white/20 bg-white/5 p-4 rounded space-y-1">
              <p className="font-mono text-[10px] uppercase text-white/60">
                OFFICIAL SECURITY HANDOVER PIN
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-3xl font-bold text-[#25845A] tracking-widest">
                  {successPin.pin}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successPin.pin);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-mono font-medium text-white hover:bg-white/20 transition"
                  title="Copy PIN"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-[#25845A]" />
                      <span className="text-[#25845A]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-white/70" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs text-white/80">
              <div className="space-y-0.5">
                <div>
                  Item: <strong className="text-white">{successPin.itemTitle}</strong>
                </div>
                <div>
                  Claimant: <strong className="text-white">{successPin.claimantName}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {successPin.telegramLink && (
                  <a
                    href={successPin.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono font-medium text-white hover:bg-white/20 transition"
                  >
                    <Send className="h-3 w-3 text-[#3867E8]" />
                    <span>Telegram Alert</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>
                )}

                {successPin.directLink && (
                  <a
                    href={successPin.directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono font-medium text-white hover:bg-white/20 transition"
                  >
                    <MessageSquare className="h-3 w-3 text-[#25845A]" />
                    <span>WhatsApp Alert</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center text-[#777777] text-xs font-mono border-[#DADAD6] bg-white">
          [SCANNING CLAIMS REPOSITORY...]
        </div>
      ) : claims.length === 0 ? (
        <div className="card p-16 text-center space-y-3 border-[#DADAD6] bg-white rounded">
          <ShieldCheck className="mx-auto h-8 w-8 text-[#25845A]" />
          <h2 className="text-sm font-semibold text-[#171717]">Queue is Clear</h2>
          <p className="text-xs text-[#777777] max-w-sm mx-auto">
            No ownership claims are currently awaiting staff verification review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => {
            const isApproved = ["HANDOVER_SCHEDULED", "COMPLETED"].includes(claim.status);
            const isCompleted = claim.status === "COMPLETED";

            return (
              <div
                key={claim.id}
                className="card p-6 sm:p-7 space-y-6 border-[#DADAD6] bg-white rounded"
              >
                {/* Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DADAD6] pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-semibold px-2.5 py-1 rounded border uppercase tracking-wide ${
                        claim.status === "HANDOVER_SCHEDULED"
                          ? "bg-[#25845A]/10 text-[#25845A] border-[#25845A]/30"
                          : isCompleted
                          ? "bg-[#171717]/5 text-[#171717] border-[#DADAD6]"
                          : "bg-[#C27803]/10 text-[#C27803] border-[#C27803]/30"
                      }`}
                    >
                      {claim.status.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-xs text-[#777777]">
                      CLAIM ID: {claim.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#777777]">
                    <User className="h-3.5 w-3.5 text-[#777777]" />
                    <span>
                      Claimant: <strong className="text-[#171717]">{claim.claimant?.name || "Student"}</strong> ({claim.claimant?.email})
                    </span>
                  </div>
                </div>

                {/* Audit Inspection Grid: Secured Specimen vs Claimant Proofs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left Column: Physical Property Details & Internal Notes */}
                  <div className="space-y-3 rounded border border-[#DADAD6] bg-[#F7F7F5] p-4 text-xs">
                    <span className="font-mono text-[10px] uppercase text-[#777777] block">
                      SECURED ITEM INTAKE RECORD
                    </span>
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded bg-white overflow-hidden border border-[#DADAD6] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getItemImageUrl(claim.item)}
                          alt={claim.item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="font-semibold text-sm text-[#171717] truncate">{claim.item.title}</div>
                        <div className="text-[#777777]">Intake: {claim.item.primaryLocation?.name}</div>
                        <div className="font-mono text-[10px] text-[#777777]">
                          Recorded: {new Date(claim.item.incidentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Staff Private Inspection Record */}
                    {claim.item.privateNotes && (
                      <div className="rounded border border-[#C27803]/30 bg-[#C27803]/5 p-3 space-y-1 text-xs">
                        <span className="font-mono text-[10px] uppercase font-bold text-[#C27803] flex items-center gap-1">
                          <Lock className="h-3 w-3" /> CONFIDENTIAL PHYSICAL INSPECTION LOG:
                        </span>
                        <p className="text-[#171717] font-mono text-[11px]">&quot;{claim.item.privateNotes}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Claimant's Submitted Challenge Proofs */}
                  <div className="space-y-3 rounded border border-[#DADAD6] bg-[#F7F7F5] p-4 text-xs">
                    <span className="font-mono text-[10px] uppercase text-[#777777] block">
                      CLAIMANT SUBMITTED CHALLENGE PROOFS
                    </span>

                    <div className="space-y-2 text-xs">
                      {claim.verifications.map((v: any) => (
                        <div key={v.id} className="rounded border border-[#DADAD6] bg-white p-3 space-y-1">
                          <div className="font-medium text-[#777777]">Q: {v.question}</div>
                          <div className="text-[#171717] font-mono text-[11px] bg-[#F7F7F5] p-2 rounded border border-[#DADAD6]">
                            A: &quot;{v.claimantAnswer}&quot;
                          </div>
                        </div>
                      ))}

                      {claim.claimantNotes && (
                        <div className="text-[11px] text-[#777777] font-mono">
                          Notes: {claim.claimantNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Staff Actions Bar */}
                {!isApproved && !isCompleted && (
                  <div className="pt-4 border-t border-[#DADAD6] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Optional reviewer notes for handover record..."
                      value={reviewNotes[claim.id] || ""}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [claim.id]: e.target.value })}
                      className="input-field text-xs sm:max-w-md"
                    />

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleReject(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="btn-secondary text-xs px-4 py-2 border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/5"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleApprove(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{actionLoading === claim.id ? "Approving..." : "Approve & Generate PIN"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {isApproved && claim.handoverRecord && (
                  <div className="pt-3 border-t border-[#DADAD6] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#25845A] font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-[#25845A]" />
                      <span>
                        Active Release PIN: <span className="font-mono text-sm tracking-wider">{claim.handoverRecord.handoverCode}</span>
                      </span>
                    </div>

                    {!isCompleted ? (
                      <Link
                        href={`/staff/handover?claimId=${claim.id}&pin=${claim.handoverRecord.handoverCode}`}
                        className="btn-primary text-xs py-1.5"
                      >
                        Open In-Person Handover Desk
                      </Link>
                    ) : (
                      <span className="font-mono text-[11px] text-[#777777] uppercase">
                        Case Completed &amp; Released
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
