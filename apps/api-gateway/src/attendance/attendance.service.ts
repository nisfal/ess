import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getFirstDayOfMonthString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  async getTodayStatus(userId: string) {
    const today = this.getTodayString();
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    return {
      today,
      hasClockedIn: !!attendance?.inTime,
      hasClockedOut: !!attendance?.outTime,
      attendance: attendance || null,
    };
  }

  async clockIn(userId: string) {
    const today = this.getTodayString();
    const existing = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (existing && existing.inTime) {
      throw new BadRequestException('Anda sudah melakukan absen masuk untuk hari ini.');
    }

    const now = new Date();
    const attendance = await this.prisma.attendance.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      create: {
        userId,
        date: today,
        inTime: now,
        status: 'IN',
      },
      update: {
        inTime: now,
        status: 'IN',
      },
    });

    return {
      message: 'Absen masuk berhasil dicatat',
      attendance,
    };
  }

  async clockOut(userId: string) {
    const today = this.getTodayString();
    const existing = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!existing || !existing.inTime) {
      throw new BadRequestException(
        'Anda belum melakukan absen masuk hari ini. Silakan absen masuk terlebih dahulu.',
      );
    }

    if (existing.outTime) {
      throw new BadRequestException('Anda sudah melakukan absen pulang untuk hari ini.');
    }

    const now = new Date();
    const attendance = await this.prisma.attendance.update({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      data: {
        outTime: now,
        status: 'OUT',
      },
    });

    return {
      message: 'Absen pulang berhasil dicatat',
      attendance,
    };
  }

  async getSummary(userId: string, startDate?: string, endDate?: string) {
    const defaultStart = this.getFirstDayOfMonthString();
    const defaultEnd = this.getTodayString();

    const fromDate = startDate || defaultStart;
    const toDate = endDate || defaultEnd;

    const attendances = await this.prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      fromDate,
      toDate,
      totalCount: attendances.length,
      records: attendances.map((item) => ({
        id: item.id,
        date: item.date,
        inTime: item.inTime,
        outTime: item.outTime,
        status: item.status,
      })),
    };
  }
}
