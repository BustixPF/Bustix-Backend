import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';
import { Role } from '../../common/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El nombre no puede tener más de 80 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser un email válido' })
  email?: string;

  @IsOptional()
  @IsInt({ message: 'El DNI debe ser un número entero' })
  dni?: number;

  @IsOptional()
  @IsInt({ message: 'El teléfono debe ser un número' })
  phone?: number;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
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
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres' })
  @MaxLength(80, {
    message: 'La dirección no puede tener más de 80 caracteres',
  })
  address?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  /**
   * Empresa asociada (solo para Admin)
   */
  @IsOptional()
  @IsUUID()
  companyId?: string; // 🔑 nuevo campo
}
