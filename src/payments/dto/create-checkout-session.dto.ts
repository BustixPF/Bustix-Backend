import { IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
  /** Id del viaje que se quiere comprar */
  @IsUUID()
  tripId: string;

  /** Id del asiento elegido dentro de ese viaje */
  @IsUUID()
  seatId: string;
}
