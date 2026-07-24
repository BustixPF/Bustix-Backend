import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class SalesQueryDto {
  @ApiPropertyOptional({
    example: '2d89af0c-c685-4c48-a8c6-1a9b2fd8d8f5',
    description: 'Filtra ventas por usuario.',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    example: 'Cartagena',
    description: 'Filtra por destino parcial.',
  })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiPropertyOptional({
    example: '2026-07-01',
    description: 'Fecha inicial en formato ISO.',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description: 'Fecha final en formato ISO.',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
