import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
  /** Id del viaje que se quiere comprar */
  @IsUUID()
  tripId: string;

  /** Ids de los asientos elegidos dentro de ese viaje (uno o más) */
  @IsArray()
  @ArrayMinSize(1, { message: 'Debés elegir al menos un asiento' })
  @ArrayUnique({ message: 'No podés elegir el mismo asiento dos veces' })
  @IsUUID('4', { each: true })
  seatIds: string[];
}
