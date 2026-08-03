import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendCompanyRequestReceivedTestEmailDto {
  @ApiProperty({
    example: 'empresa@bustix.com',
    description: 'Email que recibira la confirmacion de solicitud',
  })
  @IsEmail({}, { message: 'El email debe ser un email valido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiPropertyOptional({
    example: 'Transporte Demo',
    description: 'Nombre del contacto o empresa para el saludo',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  name?: string;

  @ApiProperty({
    example: 'Transporte Demo',
    description: 'Nombre de la empresa solicitante',
  })
  @IsString({ message: 'El nombre de la empresa debe ser texto' })
  companyName: string;
}
