import { IsIn, IsDateString, ValidateIf, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '../../common/trip-status.enum';

export class UpdateTripStatusDto {
  @ApiProperty({
    enum: [TripStatus.CANCELLED, TripStatus.DELAYED, TripStatus.RESCHEDULED],
    description: 'Nuevo estado del viaje (CANCELLED, DELAYED, RESCHEDULED)',
    example: TripStatus.RESCHEDULED,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value)) // 👈 Normaliza minúsculas a mayúsculas
  @IsIn([TripStatus.CANCELLED, TripStatus.DELAYED, TripStatus.RESCHEDULED], {
    message: 'El estado debe ser CANCELLED, DELAYED o RESCHEDULED',
  })
  status: TripStatus;

  @ApiPropertyOptional({
    description: 'Nueva fecha de salida (Formato ISO, obligatorio si status es RESCHEDULED)',
    example: '2026-08-20T10:00:00.000Z',
  })
  @ValidateIf((o: UpdateTripStatusDto) => o.status === TripStatus.RESCHEDULED)
  @IsDateString(
    {},
    { message: 'newDepartureDate es obligatorio cuando status es RESCHEDULED' },
  )
  @IsOptional()
  newDepartureDate?: string;
}

