import { prisma } from "./prisma";

export interface LogAuditParams {
  institutionId: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export async function logAudit({
  institutionId,
  actorId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
}: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        institutionId,
        actorId: actorId || null,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("[AuditLog Error]", error);
    return null;
  }
}
