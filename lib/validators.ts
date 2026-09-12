import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "STAFF", "ADMIN", "SUPER_ADMIN"]).default("STUDENT"),
  studentOrStaffId: z.string().optional(),
  phone: z.string().optional(),
  institutionSlug: z.string().default("apex"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createItemSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please provide at least 10 characters of description"),
  categoryId: z.string().min(1, "Category is required"),
  primaryLocationId: z.string().min(1, "Location is required"),
  incidentDate: z.string().or(z.date()),
  incidentTime: z.string().optional(),
  imageUrl: z.string().optional(),
  isHighValue: z.boolean().default(false),
  privateNotes: z.string().optional(),
});

export const createSightingSchema = z.object({
  itemId: z.string(),
  locationId: z.string(),
  timestamp: z.string().or(z.date()),
  sightingType: z.enum(["OBSERVED", "AI_INFERRED"]).default("OBSERVED"),
  confidence: z.number().min(0).max(1).default(1.0),
  reportedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const createClaimSchema = z.object({
  itemId: z.string(),
  lostItemId: z.string().optional(),
  verificationAnswers: z.array(
    z.object({
      question: z.string(),
      answer: z.string().min(1, "Answer is required"),
    })
  ).min(1, "At least one verification response is required"),
  evidenceFiles: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const verifyClaimSchema = z.object({
  claimId: z.string(),
  action: z.enum(["APPROVE", "REJECT", "REQUEST_INFO"]),
  reviewerNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const handoverSchema = z.object({
  claimId: z.string(),
  handoverCode: z.string().min(4, "Invalid handover verification code"),
  handoverLocationId: z.string(),
  idVerificationMethod: z.enum(["STUDENT_ID_CARD", "GOVT_ID", "STAFF_ATTESTATION"]).default("STUDENT_ID_CARD"),
  claimantSignature: z.string().optional(),
  notes: z.string().optional(),
});

export const reviewMatchSchema = z.object({
  matchId: z.string(),
  action: z.enum(["CONFIRM", "DISMISS"]),
  notes: z.string().optional(),
});

export const mergeDuplicatesSchema = z.object({
  clusterId: z.string(),
  canonicalItemId: z.string(),
  itemIds: z.array(z.string()).min(2),
  notes: z.string().optional(),
});
