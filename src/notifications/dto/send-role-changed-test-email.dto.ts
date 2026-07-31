import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../common/roles.enum';

export class SendRoleChangedTestEmailDto {
  @ApiProperty({
    example: 'usuario@bustix.com',
    description: 'Email que recibira el correo de cambio de rol',
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
    enum: Role,
    example: Role.Admin,
    description: 'Rol a simular en el correo de prueba',
  })
  @IsEnum(Role, {
    message: 'El rol debe ser user, admin o superAdmin',
  })
  role: Role;
}
