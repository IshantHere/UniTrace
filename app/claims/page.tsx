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
} from "lucide-react";

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
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Ownership Management</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Your Property Claims</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track verification progress and retrieve your secure security desk release PINs.
          </p>
        </div>

        <Link href="/dashboard" className="btn-secondary text-xs">
          Return to Dashboard
        </Link>
      </div>

      {claims.length === 0 ? (
        <div className="card py-16 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">No active ownership claims</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you find a match for your lost belongings, you can start zero-knowledge ownership verification to claim it.
          </p>
          <div className="pt-2">
            <Link href="/dashboard" className="btn-primary">
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
                className={`card p-6 space-y-5 transition ${
                  isHandoverReady
                    ? "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/30 ring-2 ring-emerald-500/20"
                    : isCompleted
                    ? "border-slate-200 bg-slate-50/50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`badge text-xs font-bold py-1 px-3 ${
                        claim.status === "HANDOVER_SCHEDULED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : claim.status === "COMPLETED"
                          ? "bg-slate-200 text-slate-800"
                          : claim.status === "UNDER_REVIEW"
                          ? "bg-brand-100 text-brand-800 border border-brand-200"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      STATUS: {claim.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Claim #{claim.id.slice(-8)}</span>
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Submitted {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Handover Ready Gold/Emerald Banner */}
                {isHandoverReady && (
                  <div className="rounded-2xl border border-emerald-300 bg-slate-950 text-white p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black font-black text-xs">
                          ✓
                        </span>
                        <span className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                          Verification Approved • Ready for Pickup
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Campus Security Station</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/90 rounded-xl p-4 border border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Handover Verification PIN
                        </span>
                        <div className="text-3xl font-mono font-black tracking-widest text-emerald-400">
                          {claim.handoverRecord?.handoverCode}
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1">
                        <div className="font-semibold text-white flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-brand-400" />
                          {claim.handoverRecord?.handoverLocation.name}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Present this PIN alongside your Student ID (<strong>{user.studentOrStaffId || "Active ID"}</strong>) to Officer {claim.handoverRecord?.staffUser.name} to release property.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Item Summary */}
                <div className="flex gap-4 items-start">
                  <div className="h-20 w-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={claim.item.images[0]?.url || "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb"}
                      alt={claim.item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-bold text-base text-slate-900">{claim.item.title}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      Intake Location: {claim.item.primaryLocation.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Category: <span className="font-semibold text-slate-700">{claim.item.category.name}</span> • Verification Level:{" "}
                      <span className="font-semibold text-slate-700">{claim.verificationLevel}</span>
                    </p>
                  </div>
                </div>

                {/* Submitted Verification Answers */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Your Submitted Verification Answers (Private &amp; Confidential)
                  </span>

                  <div className="space-y-2 text-xs">
                    {claim.verifications.map((v) => (
                      <div key={v.id} className="rounded-lg bg-white p-3 border border-slate-200/80 space-y-1">
                        <div className="font-semibold text-slate-800">Q: {v.question}</div>
                        <div className="text-slate-600">A: &quot;{v.claimantAnswer}&quot;</div>
                        {v.reviewerNotes && (
                          <div className="text-[11px] text-emerald-700 font-medium pt-1 border-t border-slate-100">
                            Staff Note: {v.reviewerNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <Link href={`/journey/${claim.itemId}`} className="hover:text-slate-900 font-medium flex items-center gap-1">
                    Inspect Item Journey Timeline <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {isCompleted && (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Property Handover Completed
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
