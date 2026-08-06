import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SendTravelReminderTestEmailDto {
  @ApiProperty({ example: 'pasajero@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Ana' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Bogota' })
  @IsString()
  origin: string;

  @ApiProperty({ example: 'Medellin' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2026-08-06T15:00:00.000Z' })
  @IsISO8601()
  departureDate: string;

  @ApiProperty({ example: [5, 6], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  seatNumbers: number[];

  @ApiProperty({ enum: [24, 48], example: 48 })
  @IsInt()
  @IsIn([24, 48])
  hoursBefore: 24 | 48;
}
