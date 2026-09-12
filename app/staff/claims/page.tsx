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
} from "lucide-react";

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
      const res = await fetch("/api/items");
      const json = await res.json();
      if (json.success && json.data?.items) {
        // Fetch full claims with verifications for items with claims
        const foundItems = json.data.items.filter((i: any) => i.type === "FOUND");
        const allClaims: any[] = [];
        for (const item of foundItems) {
          const itemRes = await fetch(`/api/items/${item.id}`);
          const itemJson = await itemRes.json();
          if (itemJson.success && itemJson.data?.item?.claimsReceived) {
            itemJson.data.item.claimsReceived.forEach((c: any) => {
              allClaims.push({ ...c, item: itemJson.data.item });
            });
          }
        }
        setClaims(allClaims);
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

    // Grab item/claimant info from the current claims list for the banner
    const matchClaim = claims.find((c) => c.id === claimId);

    try {
      const res = await fetch(`/api/claims/${claimId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE",
          reviewerNotes: reviewNotes[claimId] || "Answers match physical property in security depot.",
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Staff Ops</span>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              Security Desk
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Ownership Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-reference private claimant challenge answers with intake records before authorizing release.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/staff/handover" className="btn-primary text-xs">
            <Key className="h-4 w-4" />
            Go to Handover Station
          </Link>
          <Link href="/staff/dashboard" className="btn-secondary text-xs">
            Staff Overview
          </Link>
        </div>
      </div>

      {successPin && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Ownership Verified — Handover PIN Generated</span>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Send className="h-3 w-3 text-white" />
                Telegram Alert
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <MessageSquare className="h-3 w-3 text-white" />
                WhatsApp Alert
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-4 border border-emerald-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Official Security Handover PIN
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-mono font-black text-emerald-700 tracking-widest">
                  {successPin.pin}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successPin.pin);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                  title="Copy PIN"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 text-xs text-slate-600">
              <div className="space-y-0.5 sm:text-right">
                <p>
                  Item: <strong className="text-slate-900">{successPin.itemTitle}</strong>
                </p>
                <p>
                  Claimant: <strong className="text-slate-900">{successPin.claimantName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {successPin.telegramLink && (
                  <a
                    href={successPin.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-sky-600 active:scale-95 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Open in Telegram
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                )}

                {successPin.directLink && (
                  <a
                    href={successPin.directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Open in WhatsApp
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-emerald-900 bg-emerald-100/60 rounded-xl p-3 border border-emerald-200">
            <Send className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">
                Multi-Channel Mobile Alert System Active (Telegram + WhatsApp)
              </p>
              <p className="text-emerald-800">
                Dispatches the <strong>Handover PIN ({successPin.pin})</strong>, <strong>Item Title</strong>, direct link to <strong>Product Photo</strong>, and Claimant identity so officers can instantly verify the student at the counter.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card py-16 text-center text-slate-400 text-sm">Loading claims queue...</div>
      ) : claims.length === 0 ? (
        <div className="card py-16 text-center space-y-2">
          <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
          <h2 className="text-base font-bold text-slate-800">Queue is Clear</h2>
          <p className="text-xs text-slate-500">No ownership claims are currently awaiting staff verification.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => {
            const isApproved = ["HANDOVER_SCHEDULED", "COMPLETED"].includes(claim.status);
            const isCompleted = claim.status === "COMPLETED";

            return (
              <div
                key={claim.id}
                className="card p-6 space-y-5 border-slate-200 bg-white hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`badge text-xs font-bold py-1 px-3 ${
                        claim.status === "HANDOVER_SCHEDULED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isCompleted
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {claim.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Claim ID: {claim.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Claimant: <strong className="text-slate-900">{claim.claimant?.name || "Student"}</strong> (
                    {claim.claimant?.email})
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Property Card */}
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Secured Item Details
                    </span>
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-lg bg-slate-200 overflow-hidden border border-slate-300 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={claim.item.images?.[0]?.url || "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb"}
                          alt={claim.item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="font-bold text-sm text-slate-900 truncate">{claim.item.title}</div>
                        <div className="text-xs text-slate-500">Intake: {claim.item.primaryLocation?.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(claim.item.incidentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Staff Private Inspection Record */}
                    {claim.item.privateNotes && (
                      <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-3 space-y-1 text-xs">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5 text-amber-700" /> Confidential Intake Inspection Record:
                        </span>
                        <p className="text-amber-800">&quot;{claim.item.privateNotes}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Claimant Answers */}
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Claimant Submitted Verification Answers
                    </span>

                    <div className="space-y-2 text-xs">
                      {claim.verifications.map((v: any) => (
                        <div key={v.id} className="rounded-lg bg-white p-3 border border-slate-200 space-y-1">
                          <div className="font-semibold text-slate-700">Q: {v.question}</div>
                          <div className="text-slate-900 font-medium bg-slate-50 p-2 rounded border border-slate-100">
                            A: &quot;{v.claimantAnswer}&quot;
                          </div>
                        </div>
                      ))}

                      {claim.claimantNotes && (
                        <div className="text-[11px] text-slate-500 italic">
                          Notes: {claim.claimantNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Staff Actions Bar */}
                {!isApproved && !isCompleted && (
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Optional reviewer notes for handover record..."
                      value={reviewNotes[claim.id] || ""}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [claim.id]: e.target.value })}
                      className="input-field text-xs sm:max-w-md"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleReject(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleApprove(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {actionLoading === claim.id ? "Approving..." : "Approve & Generate PIN"}
                      </button>
                    </div>
                  </div>
                )}

                {isApproved && claim.handoverRecord && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Active Handover PIN: <span className="font-mono text-sm">{claim.handoverRecord.handoverCode}</span>
                    </div>

                    {!isCompleted ? (
                      <Link
                        href={`/staff/handover?claimId=${claim.id}&pin=${claim.handoverRecord.handoverCode}`}
                        className="btn-primary text-xs py-1.5"
                      >
                        Open In-Person Handover Desk
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-500">Case Completed &amp; Released</span>
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
