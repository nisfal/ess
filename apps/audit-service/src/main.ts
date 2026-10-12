import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AuditModule } from './audit.module';

async function bootstrap() {
  const logger = new Logger('AuditMicroserviceBootstrap');
  const app = await NestFactory.create(AuditModule);

  app.enableCors({
    origin: '*',
  });

  const useRabbitMQ = process.env.USE_RABBITMQ === 'true';

  if (useRabbitMQ) {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    logger.log(`Connecting Microservice Listener to RabbitMQ: ${rabbitUrl}`);
    app.connectMicroservice({
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
    const tcpPort = Number(process.env.TCP_PORT) || 4001;
    logger.log(`Setting up Microservice Listener on TCP Port: ${tcpPort}`);
    app.connectMicroservice({
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: tcpPort,
      },
    });
  }

  await app.startAllMicroservices();
  logger.log(`📡 Audit Microservice listener is active and waiting for events!`);

  const httpPort = Number(process.env.PORT) || 3001;
  await app.listen(httpPort);
  logger.log(`🚀 Audit HTTP Service is running on http://localhost:${httpPort}/audit/logs`);
}

bootstrap();
