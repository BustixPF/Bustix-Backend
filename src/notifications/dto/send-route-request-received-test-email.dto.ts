import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RouteRequestType } from '../../dashboard/entities/route-request.entity';

export class SendRouteRequestReceivedTestEmailDto {
  @ApiProperty({
    example: 'admin@bustix.com',
    description: 'Email que recibira la confirmacion de solicitud de ruta',
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

  @ApiProperty({
    enum: RouteRequestType,
    example: RouteRequestType.Add,
    description: 'Tipo de solicitud de ruta',
  })
  @IsEnum(RouteRequestType, {
    message: 'El tipo debe ser add o delete',
  })
  type: RouteRequestType;

  @ApiPropertyOptional({
    example: 'Bogota',
    description: 'Origen de la ruta a crear',
  })
  @IsOptional()
  @IsString({ message: 'El origen debe ser texto' })
  origin?: string;

  @ApiPropertyOptional({
    example: 'Medellin',
    description: 'Destino de la ruta a crear',
  })
  @IsOptional()
  @IsString({ message: 'El destino debe ser texto' })
  destination?: string;

  @ApiPropertyOptional({
    example: 'route-123',
    description: 'Identificador de la ruta para solicitudes de baja',
  })
  @IsOptional()
  @IsString({ message: 'La ruta debe ser texto' })
  routeId?: string;
}
