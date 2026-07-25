import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryResponseDto {
  @ApiProperty({ example: 20 })
  companyCount: number;

  @ApiProperty({ example: 153 })
  ticketCount: number;

  @ApiProperty({ example: 4 })
  pendingCompanyRequests: number;

  @ApiProperty({ example: 7 })
  pendingRouteRequests: number;
}
