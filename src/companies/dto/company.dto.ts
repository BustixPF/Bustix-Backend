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
import { ApiProperty } from '@nestjs/swagger';
import { CompanyStatus } from '../../common/company-status.enum';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Mi Empresa S.A.',
    description: 'Nombre de la empresa',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty({
    example: '123456789',
    description: 'Número de NIT de la empresa',
  })
  @IsNumberString()
  @IsNotEmpty()
  nit: string;

  @ApiProperty({
    example: 'empresa@correo.com',
    description: 'Correo corporativo',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '3001234567',
    description: 'Teléfono de contacto',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Password123!', description: 'Contraseña segura' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(15)
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Confirmación de la contraseña',
  })
  @IsNotEmpty()
  confirmPassword: string;
}

export class CreateCompanyResponseDto {
  @ApiProperty({ example: '164ea32a-2f2d-4a91-b638-c027add0345c' })
  id: string;

  @ApiProperty({ example: 'Mi Empresa S.A.' })
  name: string;

  @ApiProperty({ example: '123456789' })
  nit: string;

  @ApiProperty({ example: 'empresa@correo.com' })
  email: string;

  @ApiProperty({ example: '3001234567' })
  phone: string;

  @ApiProperty({ enum: CompanyStatus, example: CompanyStatus.PENDING })
  status: CompanyStatus;

  @ApiProperty({
    description:
      'Token temporal para subir documentos sin una sesión de usuario',
  })
  documentUploadToken: string;

  @ApiProperty({ example: 1800 })
  documentUploadTokenExpiresIn: number;
}

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Nueva Empresa S.A.', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '987654321', required: false })
  @IsOptional()
  @IsNumberString()
  nit?: string;

  @ApiProperty({ example: 'nuevo@correo.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '3109876543', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'NewPassword123!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @IsStrongPassword()
  password?: string;
}

export class RejectCompanyDto {
  @ApiProperty({
    example: 'La documentacion de la empresa esta incompleta.',
    description: 'Motivo que recibira la empresa en el email de rechazo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
