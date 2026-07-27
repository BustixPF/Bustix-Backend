// company.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsStrongPassword,
  IsNumberString,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El nombre no puede tener más de 80 caracteres' })
  @IsNotEmpty()
  name: string;

  @IsNumberString({}, { message: 'El NIT debe contener solo números' })
  @IsNotEmpty({ message: 'El NIT es obligatorio' })
  nit: string; // NIT

  @IsEmail({}, { message: 'El email debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string; // CORREO ELECTRÓNICO CORPORATIVO

  @IsNotEmpty()
  phone: string; // TELÉFONO

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
  password: string; // CONTRASEÑA

  @IsNotEmpty({ message: 'La confirmación de la contraseña es obligatoria' })
  confirmPassword: string; // CONFIRMAR CONTRASEÑA
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  nit?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  phone?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;
}
