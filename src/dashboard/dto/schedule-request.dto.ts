import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ScheduleRequestStatus } from '../entities/schedule-request.entity';

export class CreateScheduleRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  routeId: number;

  @ApiProperty({ example: '2026-08-15T09:30:00.000Z' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @IsPositive()
  totalSeats: number;
}

export class RespondScheduleRequestDto {
  @ApiProperty({
    enum: [ScheduleRequestStatus.Accepted, ScheduleRequestStatus.Rejected],
    example: ScheduleRequestStatus.Accepted,
  })
  @IsIn([ScheduleRequestStatus.Accepted, ScheduleRequestStatus.Rejected])
  status: ScheduleRequestStatus;

  @ApiPropertyOptional({ example: 'Horario revisado correctamente.' })
  @IsString()
  @IsOptional()
  message?: string;
}
