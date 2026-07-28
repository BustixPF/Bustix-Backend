import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCheckoutSessionDto {
  /**
   * Monto a cobrar, en la unidad principal de la moneda (no en centavos)
   * @example 25.50
   */
  @IsNumber()
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  amount: number;

  /**
   * Código de moneda ISO 4217 en minúsculas. Si no se envía, se usa 'usd' por defecto
   * @example 'usd'
   */
  @IsOptional()
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  currency?: string;

  /**
   * Descripción del producto o servicio que se está cobrando, se muestra en la pantalla de pago de Stripe
   * @example 'Pasaje Buenos Aires - Mendoza'
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  /**
   * Id del usuario que realiza la compra. Se asocia al registro de pago para poder rastrear el historial
   * @example 'd609dfc2-00ed-4d29-a38e-12101ba9eab7'
   */
  @IsOptional()
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  userId?: string;
}
