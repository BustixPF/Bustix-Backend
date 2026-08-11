import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserActiveDto {
  @ApiProperty({
    example: false,
    description: 'Estado del usuario (true para activo, false para deshabilitado)',
  })
  @IsBoolean({ message: 'El campo isActive debe ser un valor booleano' })
  isActive: boolean;
}