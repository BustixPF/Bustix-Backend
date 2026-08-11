import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../common/roles.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: Role.Admin,
    enum: Role,
    description: 'Nuevo rol a asignar al usuario',
  })
  @IsEnum(Role, { message: 'El rol especificado no es válido' })
  role: Role;
}