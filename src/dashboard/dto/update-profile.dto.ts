import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Usuario Actualizado' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 1123456789 })
  @IsInt()
  @IsOptional()
  phone?: number;

  @ApiPropertyOptional({ example: 'Avenida Siempre Viva 742' })
  @IsString()
  @IsOptional()
  address?: string;
}
