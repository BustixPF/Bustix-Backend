import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleRequestStatus } from '../entities/schedule-request.entity';
import { DashboardUserResponseDto } from './dashboard-user-response.dto';

export class ScheduleRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  routeId: number;

  @ApiProperty()
  origin: string;

  @ApiProperty()
  destination: string;

  @ApiProperty()
  departureDate: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  totalSeats: number;

  @ApiProperty({ enum: ScheduleRequestStatus })
  status: ScheduleRequestStatus;

  @ApiPropertyOptional()
  createdTripId?: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty({ type: () => DashboardUserResponseDto })
  requestedBy: DashboardUserResponseDto;
}
