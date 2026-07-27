import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/roles.enum';

export class ChangeRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.Admin,
    description: 'Nuevo rol que se asignara al usuario.',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
