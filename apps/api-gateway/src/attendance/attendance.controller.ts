import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('today')
  async getTodayStatus(@Request() req: any) {
    return this.attendanceService.getTodayStatus(req.user.id);
  }

  @Post('clock-in')
  async clockIn(@Request() req: any) {
    return this.attendanceService.clockIn(req.user.id);
  }

  @Post('clock-out')
  async clockOut(@Request() req: any) {
    return this.attendanceService.clockOut(req.user.id);
  }

  @Get('summary')
  async getSummary(@Request() req: any, @Query() query: SummaryQueryDto) {
    return this.attendanceService.getSummary(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }
}
