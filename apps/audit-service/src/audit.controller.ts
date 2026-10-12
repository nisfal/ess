import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService, AuditEventPayload } from './audit.service';

@Controller('audit')
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  // Message Queue Event Consumer for 'employee.profile.updated'
  @EventPattern('employee.profile.updated')
  async handleProfileUpdated(@Payload() payload: AuditEventPayload) {
    this.logger.log(`Received MQ event: 'employee.profile.updated'`);
    return this.auditService.recordAuditLog(payload);
  }

  // Request-Response pattern for fetching all audit logs
  @MessagePattern('audit.get_all_logs')
  async handleGetAllLogs() {
    return this.auditService.getAllLogs();
  }

  // REST API endpoint for direct inspection
  @Get('logs')
  async getLogsHttp() {
    return this.auditService.getAllLogs();
  }
}
