import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
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
  @ValidateIf(
    (dto: RespondCompanyRequestDto) =>
      dto.status === CompanyRequestStatus.Rejected || dto.message !== undefined,
  )
  @IsString()
  @IsNotEmpty()
  message?: string;
}
