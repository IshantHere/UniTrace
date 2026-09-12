export const ROLES = {
  STUDENT: "STUDENT",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ITEM_TYPES = {
  LOST: "LOST",
  FOUND: "FOUND",
} as const;
export type ItemType = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];

export const ITEM_STATUSES = {
  ACTIVE: "ACTIVE",
  MATCH_PENDING: "MATCH_PENDING",
  UNDER_VERIFICATION: "UNDER_VERIFICATION",
  RECOVERED: "RECOVERED",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ItemStatus = (typeof ITEM_STATUSES)[keyof typeof ITEM_STATUSES];

export const MODERATION_STATUSES = {
  APPROVED: "APPROVED",
  PENDING_REVIEW: "PENDING_REVIEW",
  FLAGGED: "FLAGGED",
  REJECTED: "REJECTED",
} as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[keyof typeof MODERATION_STATUSES];

export const CLAIM_STATUSES = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFICATION_REQUIRED: "VERIFICATION_REQUIRED",
  VERIFIED: "VERIFIED",
  HANDOVER_SCHEDULED: "HANDOVER_SCHEDULED",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[keyof typeof CLAIM_STATUSES];

export const SIGHTING_TYPES = {
  OBSERVED: "OBSERVED",
  AI_INFERRED: "AI_INFERRED",
} as const;
export type SightingType = (typeof SIGHTING_TYPES)[keyof typeof SIGHTING_TYPES];

export const MATCH_CONFIDENCE_TIERS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  EXCEPTIONAL: "EXCEPTIONAL",
} as const;
export type MatchConfidenceTier = (typeof MATCH_CONFIDENCE_TIERS)[keyof typeof MATCH_CONFIDENCE_TIERS];

export const MATCH_STATUSES = {
  POTENTIAL: "POTENTIAL",
  REVIEWED_BY_STAFF: "REVIEWED_BY_STAFF",
  CONFIRMED: "CONFIRMED",
  DISMISSED: "DISMISSED",
} as const;
export type MatchStatus = (typeof MATCH_STATUSES)[keyof typeof MATCH_STATUSES];

export const DUPLICATE_CLUSTER_STATUSES = {
  SUGGESTED: "SUGGESTED",
  MERGED: "MERGED",
  DISMISSED: "DISMISSED",
} as const;
export type DuplicateClusterStatus = (typeof DUPLICATE_CLUSTER_STATUSES)[keyof typeof DUPLICATE_CLUSTER_STATUSES];

export const NOTIFICATION_TYPES = {
  MATCH_FOUND: "MATCH_FOUND",
  HIGH_CONFIDENCE_MATCH: "HIGH_CONFIDENCE_MATCH",
  CLAIM_UPDATE: "CLAIM_UPDATE",
  VERIFICATION_REQUEST: "VERIFICATION_REQUEST",
  HANDOVER_READY: "HANDOVER_READY",
  SYSTEM_ALERT: "SYSTEM_ALERT",
} as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const DEFAULT_INSTITUTION = {
  id: "inst_apex_university",
  name: "Apex University",
  slug: "apex",
  domain: "apex.edu",
};
