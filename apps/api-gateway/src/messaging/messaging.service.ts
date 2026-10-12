import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

export interface ProfileUpdatedEvent {
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, any>;
  performedBy: string;
  timestamp: string;
}

@Injectable()
export class MessagingService implements OnModuleInit {
  private readonly logger = new Logger(MessagingService.name);
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const useRabbitMQ = this.configService.get<string>('USE_RABBITMQ') === 'true';

    if (useRabbitMQ) {
      const rabbitUrl =
        this.configService.get<string>('RABBITMQ_URL') ||
        'amqp://guest:guest@localhost:5672';
      this.logger.log(`Connecting Messaging Client to RabbitMQ: ${rabbitUrl}`);
      this.client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [rabbitUrl],
          queue: 'audit_logs_queue',
          queueOptions: {
            durable: false,
          },
        },
      });
    } else {
      const host =
        this.configService.get<string>('AUDIT_SERVICE_TCP_HOST') || '127.0.0.1';
      const port =
        Number(this.configService.get<number>('AUDIT_SERVICE_TCP_PORT')) || 4001;
      this.logger.log(
        `Connecting Messaging Client to Microservice TCP: ${host}:${port}`,
      );
      this.client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host,
          port,
        },
      });
    }
  }

  async publishProfileUpdated(event: ProfileUpdatedEvent): Promise<void> {
    try {
      this.logger.log(
        `Publishing event 'employee.profile.updated' for user ${event.performedBy}`,
      );
      // Emit asynchronously via message queue / event stream
      this.client.emit('employee.profile.updated', event).pipe(
        timeout(3000),
        catchError((err) => {
          this.logger.warn(
            `Could not emit event to audit-service microservice: ${err.message}`,
          );
          return of(null);
        }),
      ).subscribe();
    } catch (error) {
      this.logger.error(`Error in publishProfileUpdated: ${error.message}`);
    }
  }

  async fetchAuditLogs(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.client.send('audit.get_all_logs', {}).pipe(
          timeout(3000),
          catchError((err) => {
            this.logger.warn(`Failed to fetch audit logs from microservice: ${err.message}`);
            return of([]);
          }),
        ),
      );
      return response || [];
    } catch (error) {
      this.logger.warn(`Could not reach audit-service microservice: ${error.message}`);
      return [];
    }
  }
}
