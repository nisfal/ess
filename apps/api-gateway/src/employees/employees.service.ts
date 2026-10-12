import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EventsGateway } from '../websocket/events.gateway';
import { MessagingService } from '../messaging/messaging.service';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly messagingService: MessagingService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        position: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Data karyawan tidak ditemukan');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!current) {
      throw new NotFoundException('Data karyawan tidak ditemukan');
    }

    const changedFields: string[] = [];
    const dataToUpdate: any = {};
    const oldSnapshot: Record<string, any> = {};
    const newSnapshot: Record<string, any> = {};

    // 1. Phone check
    if (dto.phone !== undefined && dto.phone !== current.phone) {
      changedFields.push('Nomor Handphone');
      oldSnapshot.phone = current.phone;
      newSnapshot.phone = dto.phone;
      dataToUpdate.phone = dto.phone;
    }

    // 2. Avatar / Foto check
    if (dto.avatarUrl !== undefined && dto.avatarUrl !== current.avatarUrl) {
      changedFields.push('Foto Profil');
      oldSnapshot.avatarUrl = current.avatarUrl ? 'Foto sebelumnya' : 'Belum ada foto';
      newSnapshot.avatarUrl = 'Foto diperbarui';
      dataToUpdate.avatarUrl = dto.avatarUrl;
    }

    // 3. Password check
    if (dto.password) {
      if (dto.currentPassword) {
        const isMatch = await bcrypt.compare(dto.currentPassword, current.password);
        if (!isMatch) {
          throw new BadRequestException('Password saat ini (lama) tidak sesuai');
        }
      }
      changedFields.push('Password');
      oldSnapshot.password = '******';
      newSnapshot.password = 'Password diperbarui (hashed)';
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      dataToUpdate.password = hashedPassword;
    }

    // Update database operasional
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        position: true,
        avatarUrl: true,
        role: true,
        updatedAt: true,
      },
    });

    // If there were modifications, trigger side-effects:
    if (changedFields.length > 0) {
      const now = new Date();

      // Feature 1: Real-time Alert popup via Socket.io to Admin HRD
      this.eventsGateway.notifyAdminProfileUpdate({
        employeeId: updatedUser.id,
        employeeName: updatedUser.name,
        employeeEmail: updatedUser.email,
        changedFields,
        timestamp: now,
        details: {
          phone: updatedUser.phone,
          hasNewAvatar: !!dto.avatarUrl,
        },
      });

      // Feature 2: Asynchronous Data Stream / Message Queue to separate Audit Database
      await this.messagingService.publishProfileUpdated({
        entityType: 'EMPLOYEE_PROFILE',
        entityId: updatedUser.id,
        action: 'UPDATE_PROFILE',
        changes: {
          changedFields,
          old: oldSnapshot,
          new: newSnapshot,
        },
        performedBy: updatedUser.email,
        timestamp: now.toISOString(),
      });
    }

    return {
      message: 'Profil berhasil diperbarui',
      user: updatedUser,
      changedFields,
    };
  }
}
