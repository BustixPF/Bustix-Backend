import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCompanyActiveDto {
  @ApiProperty({ example: false, description: 'Estado activo o inactivo de la empresa' })
  @IsBoolean()
  isActive: boolean;
}