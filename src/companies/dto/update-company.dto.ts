import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CompanyStatus } from '../../common/company-status.enum';

export class UpdateCompanyStatusDto {
  @ApiProperty({
    enum: CompanyStatus,
    example: CompanyStatus.APPROVED,
    description: 'Estado a asignar a la empresa (APPROVED o REJECTED)',
  })
  @IsNotEmpty()
  @IsEnum(CompanyStatus)
  status: CompanyStatus;
}