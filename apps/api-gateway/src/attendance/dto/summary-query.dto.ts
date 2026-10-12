import { IsOptional, IsString } from 'class-validator';

export class SummaryQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD
}
