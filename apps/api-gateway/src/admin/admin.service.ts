import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  async getAllEmployees(search?: string) {
    const whereClause: any = {
      role: 'EMPLOYEE',
    };

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      whereClause.OR = [
        { name: { contains: keyword } },
        { email: { contains: keyword } },
        { position: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const employees = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      total: employees.length,
      employees,
    };
  }

  async createEmployee(dto: CreateEmployeeDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email perusahaan sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const employee = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        phone: dto.phone,
        position: dto.position,
        avatarUrl: dto.avatarUrl,
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Karyawan baru berhasil ditambahkan',
      employee,
    };
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Data karyawan tidak ditemukan');
    }

    if (dto.email && dto.email.toLowerCase() !== employee.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existingEmail) {
        throw new ConflictException('Email perusahaan sudah digunakan oleh akun lain');
      }
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase();
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        avatarUrl: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Data karyawan berhasil diperbarui',
      employee: updated,
    };
  }

  async getAllAttendances(params?: {
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const whereClause: any = {};

    if (params?.startDate || params?.endDate) {
      whereClause.date = {};
      if (params.startDate) whereClause.date.gte = params.startDate;
      if (params.endDate) whereClause.date.lte = params.endDate;
    }

    if (params?.search && params.search.trim() !== '') {
      const keyword = params.search.trim();
      whereClause.user = {
        OR: [
          { name: { contains: keyword } },
          { email: { contains: keyword } },
          { position: { contains: keyword } },
        ],
      };
    }

    const attendances = await this.prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      total: attendances.length,
      records: attendances.map((item) => ({
        id: item.id,
        date: item.date,
        inTime: item.inTime,
        outTime: item.outTime,
        status: item.status,
        employee: item.user,
      })),
    };
  }

  async getAuditLogs() {
    const logs = await this.messagingService.fetchAuditLogs();
    return {
      source: 'Separate Audit Database (Microservice Consumer)',
      total: logs.length,
      logs,
    };
  }
}
