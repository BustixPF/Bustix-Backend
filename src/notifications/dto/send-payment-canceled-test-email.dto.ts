import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SendPaymentCanceledTestEmailDto {
  @ApiProperty({
    example: 'comprador@bustix.com',
    description: 'Email que recibira la notificacion de pago cancelado',
  })
  @IsEmail({}, { message: 'El email debe ser un email valido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiPropertyOptional({
    example: 'Pablo',
    description: 'Nombre que aparecera en el saludo del correo',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  name?: string;

  @ApiProperty({ example: 'Bogota' })
  @IsString({ message: 'El origen debe ser texto' })
  origin: string;

  @ApiProperty({ example: 'Medellin' })
  @IsString({ message: 'El destino debe ser texto' })
  destination: string;

  @ApiProperty({ example: 2, description: 'Cantidad de pasajes solicitados' })
  @IsNumber({}, { message: 'La cantidad de pasajes debe ser numerica' })
  @Min(1, { message: 'La cantidad de pasajes debe ser al menos 1' })
  seatCount: number;

  @ApiProperty({ example: 170000, description: 'Monto que iba a pagarse' })
  @IsNumber({}, { message: 'El total debe ser numerico' })
  @Min(0, { message: 'El total no puede ser negativo' })
  totalAmount: number;

  @ApiProperty({ example: 'cop', description: 'Moneda del pago' })
  @IsString({ message: 'La moneda debe ser texto' })
  currency: string;
}
