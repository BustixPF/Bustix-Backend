import { IsIn, IsDateString, ValidateIf } from 'class-validator';
import { TripStatus } from '../../common/trip-status.enum';

export class UpdateTripStatusDto {
  @IsIn([TripStatus.CANCELLED, TripStatus.DELAYED, TripStatus.RESCHEDULED])
  status: TripStatus;

  @ValidateIf((o: UpdateTripStatusDto) => o.status === TripStatus.RESCHEDULED)
  @IsDateString(
    {},
    { message: 'newDepartureDate es obligatorio cuando status es RESCHEDULED' },
  )
  newDepartureDate?: string;
}
