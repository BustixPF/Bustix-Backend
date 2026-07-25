import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { DashboardCompanyResponseDto } from './dashboard-company-response.dto';
import { DashboardUserResponseDto } from './dashboard-user-response.dto';

export class SaleResponseDto {
  @ApiProperty({ example: 'f0dc5639-4a6b-4b3a-b1f7-11e5e31f8f1d' })
  id: string;

  @ApiProperty({ example: 'Bogota' })
  origin: string;

  @ApiProperty({ example: 'Cartagena' })
  destination: string;

  @ApiProperty({ example: 85999.5 })
  price: number;

  @ApiProperty({ example: '2026-07-24T15:30:00.000Z' })
  purchaseDate: Date;

  @ApiPropertyOptional({ type: () => DashboardUserResponseDto, nullable: true })
  user: DashboardUserResponseDto | null;

  @ApiPropertyOptional({
    type: () => DashboardCompanyResponseDto,
    nullable: true,
  })
  company: DashboardCompanyResponseDto | null;
}
