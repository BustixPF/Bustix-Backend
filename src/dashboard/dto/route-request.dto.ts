import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { RouteRequestType } from '../entities/route-request.entity';

export class RouteRequestDto {
  @ApiProperty({ enum: RouteRequestType, example: RouteRequestType.Add })
  @IsEnum(RouteRequestType)
  type: RouteRequestType;

  @ApiPropertyOptional({ example: 'Bogota' })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiPropertyOptional({ example: 'Medellin' })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Tunja', 'Bucaramanga'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  stops?: string[];

  @ApiPropertyOptional({ example: 'route-123' })
  @IsString()
  @IsOptional()
  routeId?: string;
}
