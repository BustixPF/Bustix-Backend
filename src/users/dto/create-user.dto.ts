import {
  IsEmail,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { MatchPassword } from '../validators/match-password.validator';
import { Role } from '../../common/roles.enum';


export class CreateUserDto {
  /**
   * Nombre completo del usuario
   * @example 'Usuario Prueba'
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El nombre no puede tener más de 80 caracteres' })
  name!: string;

  /**
   * Email válido, usado para login
   * @example 'example@mail.com'
   */
  @IsEmail({}, { message: 'El email debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  /**
   * La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
   * @example 'aaBB33##'
   */
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(15, {
    message: 'La contraseña no puede tener más de 15 caracteres',
  })
  @IsStrongPassword(
    {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un símbolo',
    },
  )
  password!: string;

  /**
   * Debe ser una réplica exacta de la contraseña
   * @example 'aaBB33##'
   */
  @IsNotEmpty()
  @Validate(MatchPassword, ['password'])
  confirmPassword!: string;

  /**
   * DNI / documento de identidad, requerido para emitir el ticket
   * @example 40123456
   */
  @IsInt({ message: 'El DNI debe ser un número entero' })
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  dni!: number;

  /**
   * Teléfono de contacto
   * @example 1123456789
   */
  @IsInt({ message: 'El teléfono debe ser un número' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  phone!: number;

  /**
   * Dirección, opcional
   * @example 'Calle Falsa 123'
   */
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres' })
  @MaxLength(80, {
    message: 'La dirección no puede tener más de 80 caracteres',
  })
  address?: string;

  /**
   * Se vuelve "admin" solo por acción manual/administrativa.
   */
  @ApiHideProperty()
  @IsEmpty()
  role?: Role;
}
