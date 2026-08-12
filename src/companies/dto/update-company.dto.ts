import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CompanyStatus } from '../../common/company-status.enum';

export class UpdateCompanyStatusDto {
  @ApiProperty({
    enum: CompanyStatus,
    example: CompanyStatus.APPROVED,
    description: 'Estado a asignar a la empresa (APPROVED, REJECTED o PENDING)',
  })
  @IsNotEmpty()
  @IsEnum(CompanyStatus)
  status: CompanyStatus;

  @ApiPropertyOptional({
    example: 'Documentación fiscal incompleta',
    description: 'Motivo del rechazo (obligatorio si el status es REJECTED)',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({ example: false, description: 'Estado activo o inactivo de la empresa', required: false })
@IsOptional()
@IsBoolean()
isActive?: boolean;
}