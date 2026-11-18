import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Lock,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Key,
} from "lucide-react";
import { getItemImageUrl } from "@/lib/images";

export default async function UserClaimsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const claims = await prisma.claim.findMany({
    where: { claimantId: user.id },
    include: {
      item: {
        include: {
          category: true,
          primaryLocation: true,
          images: true,
        },
      },
      verifications: true,
      handoverRecord: {
        include: {
          handoverLocation: true,
          staffUser: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [LEDGER // PROPERTY-CLAIMS]
            </span>
            <span className="badge-neutral text-[10px]">
              VERIFICATION STATUS
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Your Property Claims
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Monitor real-time verification status and retrieve single-use authorization PINs for central security release.
          </p>
        </div>

        <Link href="/dashboard" className="btn-secondary text-xs self-start sm:self-auto">
          Return to Dashboard
        </Link>
      </div>

      {claims.length === 0 ? (
        <div className="card p-16 text-center space-y-4 border-[#DADAD6] bg-white">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded border border-[#DADAD6] bg-[#F7F7F5] text-[#777777]">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[#171717]">No active ownership claims</h2>
            <p className="text-xs text-[#777777] max-w-sm mx-auto">
              When the AI correlation engine surfaces a matched candidate for your lost belongings, initiate a zero-knowledge ownership challenge to claim it.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard" className="btn-primary text-xs">
              View Active Reports &amp; Matches
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => {
            const isHandoverReady = claim.status === "HANDOVER_SCHEDULED" && claim.handoverRecord;
            const isCompleted = claim.status === "COMPLETED";

            return (
              <div
                key={claim.id}
                className="card p-6 sm:p-7 space-y-6 bg-white border-[#DADAD6]"
              >
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DADAD6] pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-semibold px-2.5 py-1 rounded border uppercase tracking-wide ${
                        claim.status === "HANDOVER_SCHEDULED"
                          ? "bg-[#25845A]/10 text-[#25845A] border-[#25845A]/30"
                          : claim.status === "COMPLETED"
                          ? "bg-[#171717]/5 text-[#171717] border-[#DADAD6]"
                          : claim.status === "UNDER_REVIEW"
                          ? "bg-[#3867E8]/10 text-[#3867E8] border-[#3867E8]/30"
                          : "bg-[#C27803]/10 text-[#C27803] border-[#C27803]/30"
                      }`}
                    >
                      STATUS: {claim.status.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-xs text-[#777777]">
                      CLAIM #{claim.id.slice(-8)}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-[#777777] flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#777777]" />
                    SUBMITTED {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Handover Ready High-Contrast Release Ticket */}
                {isHandoverReady && (
                  <div className="border border-[#171717] bg-[#171717] text-white p-6 rounded space-y-4">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#25845A] text-white font-mono font-bold text-xs">
                          ✓
                        </span>
                        <span className="font-mono text-xs font-semibold tracking-wider text-[#25845A] uppercase">
                          VERIFICATION APPROVED • READY FOR PICKUP
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-white/60 uppercase">
                        STATION: {claim.handoverRecord?.handoverLocation.name || "SECURITY DEPOT"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      <div className="border border-white/20 bg-white/5 p-4 rounded space-y-1">
                        <span className="font-mono text-[10px] uppercase text-white/60 block">
                          SINGLE-USE RELEASE AUTHORIZATION PIN
                        </span>
                        <div className="font-mono text-3xl font-bold tracking-widest text-[#25845A]">
                          {claim.handoverRecord?.handoverCode}
                        </div>
                      </div>

                      <div className="text-xs text-white/80 space-y-1.5 leading-relaxed">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#3867E8]" />
                          {claim.handoverRecord?.handoverLocation.name}
                        </div>
                        <p className="text-[11px] text-white/70">
                          Present this PIN alongside your Student ID Card (<strong>{user.studentOrStaffId || "STU-2024-8841"}</strong>) to Officer <strong>{claim.handoverRecord?.staffUser.name || "Vijay Kumar"}</strong> at Central Security Depot to finalize physical handover.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Specimen Summary Row */}
                <div className="flex gap-4 items-start border border-[#DADAD6] p-4 bg-[#F7F7F5] rounded">
                  <div className="h-16 w-16 rounded bg-white overflow-hidden border border-[#DADAD6] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getItemImageUrl(claim.item)}
                      alt={claim.item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase text-[#777777]">TARGET PROPERTY</span>
                      <span className="badge-neutral text-[9px]">{claim.item.category.name}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#171717]">{claim.item.title}</h3>
                    <p className="text-xs text-[#777777] flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#777777] flex-shrink-0" />
                      Intake Facility: {claim.item.primaryLocation.name} • Protocol Level: {claim.verificationLevel}
                    </p>
                  </div>
                </div>

                {/* Submitted Challenge Answers */}
                <div className="border border-[#DADAD6] bg-white p-5 rounded space-y-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777] block">
                    SUBMITTED PROOF ATTESTATIONS (ZERO-KNOWLEDGE CONFIDENTIAL)
                  </span>

                  <div className="space-y-2.5 text-xs">
                    {claim.verifications.map((v) => (
                      <div key={v.id} className="rounded border border-[#DADAD6] bg-[#F7F7F5] p-3.5 space-y-1">
                        <div className="font-medium text-[#171717]">Q: {v.question}</div>
                        <div className="text-[#777777] font-mono text-[11px]">
                          A: &quot;{v.claimantAnswer}&quot;
                        </div>
                        {v.reviewerNotes && (
                          <div className="text-[11px] text-[#25845A] font-medium pt-1.5 border-t border-[#DADAD6] flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase text-[#25845A]">STAFF NOTE:</span>
                            <span>{v.reviewerNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#DADAD6] text-xs">
                  <Link
                    href={`/journey/${claim.itemId}`}
                    className="text-[#171717] hover:text-[#3867E8] font-medium inline-flex items-center gap-1.5 transition"
                  >
                    <span>Inspect Item Journey Timeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {isCompleted && (
                    <span className="font-semibold text-[#25845A] flex items-center gap-1.5 font-mono text-xs">
                      <CheckCircle2 className="h-4 w-4" /> HANDOVER COMPLETED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
