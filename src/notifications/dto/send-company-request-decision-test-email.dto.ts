import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CompanyRequestStatus } from '../../dashboard/entities/company-request.entity';

export class SendCompanyRequestDecisionTestEmailDto {
  @ApiProperty({
    example: 'empresa@bustix.com',
    description: 'Email que recibira el correo de decision',
  })
  @IsEmail({}, { message: 'El email debe ser un email valido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiPropertyOptional({
    example: 'Empresa Demo',
    description: 'Nombre que aparecera en el saludo del correo',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  name?: string;

  @ApiProperty({
    enum: CompanyRequestStatus,
    example: CompanyRequestStatus.Accepted,
    description: 'Estado a simular en el correo de prueba',
  })
  @IsEnum(CompanyRequestStatus, {
    message: 'El estado debe ser pending, accepted o rejected',
  })
  status: CompanyRequestStatus;

  @ApiPropertyOptional({
    example: 'Tu solicitud fue aprobada correctamente.',
    description: 'Mensaje adicional opcional incluido en el correo',
  })
  @IsOptional()
  @IsString({ message: 'El mensaje debe ser texto' })
  message?: string;

  @ApiPropertyOptional({
    example: '6c63dc2c-2842-48aa-98e5-e337da83eedd',
    description: 'ID de la empresa para probar el enlace a su dashboard',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El companyId debe ser un UUID valido' })
  companyId?: string;
}
