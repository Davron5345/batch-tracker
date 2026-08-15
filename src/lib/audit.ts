import { prisma } from "./prisma";

type AuditInput = {
  userId?: string | null;
  batchId?: string | null;
  entity: string;
  entityId: string;
  action: string;
  diff?: unknown;
};

export async function writeAuditLog(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      batchId: input.batchId ?? null,
      entity: input.entity,
      entityId: input.entityId,
      action: input.action,
      diff: input.diff != null ? JSON.stringify(input.diff) : null,
    },
  });
}
