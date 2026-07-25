import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CompanyRequestStatus } from '../entities/company-request.entity';

export class RespondCompanyRequestDto {
  @ApiProperty({
    enum: CompanyRequestStatus,
    example: CompanyRequestStatus.Accepted,
  })
  @IsEnum(CompanyRequestStatus)
  @IsNotEmpty()
  status: CompanyRequestStatus;

  @ApiPropertyOptional({
    example: 'Solicitud aprobada luego de verificar la documentacion.',
  })
  @IsString()
  @IsOptional()
  message?: string;
}
