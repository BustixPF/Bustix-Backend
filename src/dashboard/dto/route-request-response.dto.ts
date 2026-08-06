import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RouteRequestStatus,
  RouteRequestType,
} from '../entities/route-request.entity';
import { DashboardUserResponseDto } from './dashboard-user-response.dto';

export class RouteRequestResponseDto {
  @ApiProperty({ example: '15fab11b-38c1-4c78-a18f-6f689050dd86' })
  id: string;

  @ApiProperty({ enum: RouteRequestType, example: RouteRequestType.Add })
  type: RouteRequestType;

  @ApiPropertyOptional({ example: 'Bogota' })
  origin?: string;

  @ApiPropertyOptional({ example: 'Medellin' })
  destination?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Tunja', 'Bucaramanga'],
  })
  stops?: string[];

  @ApiPropertyOptional({ example: 360 })
  duration?: number;

  @ApiPropertyOptional({ example: 85000 })
  price?: number;

  @ApiPropertyOptional()
  companyId?: string;

  @ApiPropertyOptional({ example: 'route-123' })
  routeId?: string;

  @ApiProperty({
    enum: RouteRequestStatus,
    example: RouteRequestStatus.Pending,
  })
  status: RouteRequestStatus;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({ type: () => DashboardUserResponseDto, nullable: true })
  requestedBy: DashboardUserResponseDto | null;
}
