import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRequestStatus } from '../entities/company-request.entity';
import { DashboardUserResponseDto } from './dashboard-user-response.dto';

export class CompanyRequestResponseDto {
  @ApiProperty({ example: '8b5dc01d-3124-4f1a-a876-b0a8f3361302' })
  id: string;

  @ApiProperty({ example: 'Transporte del Sur SAS' })
  name: string;

  @ApiProperty({ example: '900123456-7' })
  nit: string;

  @ApiProperty({ example: 'contacto@transportedelsur.com' })
  email: string;

  @ApiPropertyOptional({
    example: 'Documentación verificada y aprobada.',
    description: 'Mensaje opcional dejado al responder la solicitud.',
  })
  message?: string;

  @ApiProperty({
    enum: CompanyRequestStatus,
    example: CompanyRequestStatus.Pending,
  })
  status: CompanyRequestStatus;

  @ApiPropertyOptional({ type: () => DashboardUserResponseDto, nullable: true })
  requestedBy: DashboardUserResponseDto | null;
}
