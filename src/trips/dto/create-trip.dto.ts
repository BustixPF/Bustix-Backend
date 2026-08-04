import {
  IsDateString,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTripDto {
  /** Id de la empresa que opera el viaje */
  @IsUUID()
  companyId: string;

  /** Id de la ruta (Route) sobre la que se programa este viaje @example 1 */
  @IsInt()
  routeId: number;

  /** Ciudad de origen @example 'Bogotá' */
  @IsString()
  @MaxLength(100)
  origin: string;

  /** Ciudad de destino @example 'Medellín' */
  @IsString()
  @MaxLength(100)
  destination: string;

  /** Fecha y hora de salida, ISO @example '2026-08-15T09:30:00.000Z' */
  @IsDateString()
  departureDate: string;

  /** Precio del pasaje @example 85000 */
  @IsNumber()
  @IsPositive()
  price: number;

  /** Cantidad total de asientos @example 40 */
  @IsInt()
  @Min(1)
  totalSeats: number;
}
