import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AuditController],
  providers: [AuditService, PrismaService],
})
export class AuditModule {}
