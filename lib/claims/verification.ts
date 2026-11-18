import { prisma } from "../prisma";
import { CLAIM_STATUSES, ClaimStatus } from "../constants";
import { logAudit } from "../audit";

export function generateHandoverPIN(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pin = "RC-";
  for (let i = 0; i < 4; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

export const VALID_CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  PENDING: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["VERIFICATION_REQUIRED", "VERIFIED", "REJECTED"],
  VERIFICATION_REQUIRED: ["UNDER_REVIEW", "REJECTED", "CANCELLED"],
  VERIFIED: ["HANDOVER_SCHEDULED", "COMPLETED", "REJECTED"],
  HANDOVER_SCHEDULED: ["COMPLETED", "EXPIRED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export function canTransitionClaim(current: ClaimStatus, next: ClaimStatus): boolean {
  const allowed = VALID_CLAIM_TRANSITIONS[current] || [];
  return allowed.includes(next);
}
