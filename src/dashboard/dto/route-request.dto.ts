import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  RouteRequestStatus,
  RouteRequestType,
} from '../entities/route-request.entity';

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

  @ApiPropertyOptional({ example: 360, description: 'Duracion en minutos' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 85000 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'route-123' })
  @IsString()
  @IsOptional()
  routeId?: string;
}

export class RespondRouteRequestDto {
  @ApiProperty({
    enum: [RouteRequestStatus.Accepted, RouteRequestStatus.Rejected],
    example: RouteRequestStatus.Accepted,
  })
  @IsIn([RouteRequestStatus.Accepted, RouteRequestStatus.Rejected])
  status: RouteRequestStatus;

  @ApiPropertyOptional({ example: 'Ruta revisada correctamente.' })
  @IsString()
  @IsOptional()
  message?: string;
}
