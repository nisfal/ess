import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export interface AuditEventPayload {
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, any>;
  performedBy?: string;
  timestamp?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordAuditLog(payload: AuditEventPayload) {
    this.logger.log(
      `📥 [Audit Microservice] Consuming event for ${payload.entityType}:${payload.entityId} (Action: ${payload.action})`,
    );

    const log = await this.prisma.auditLog.create({
      data: {
        entityType: payload.entityType || 'EMPLOYEE_PROFILE',
        entityId: payload.entityId,
        action: payload.action || 'UPDATE_PROFILE',
        changes: JSON.stringify(payload.changes || {}),
        performedBy: payload.performedBy || 'system',
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      },
    });

    this.logger.log(
      `✅ [Audit Microservice] Successfully persisted audit log ID ${log.id} to Separate Audit Database`,
    );
    return log;
  }

  async getAllLogs() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return logs.map((log) => ({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      changes: typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes,
      performedBy: log.performedBy,
      timestamp: log.timestamp,
    }));
  }
}
