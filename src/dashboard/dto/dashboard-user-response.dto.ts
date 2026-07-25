import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/roles.enum';

export class DashboardUserResponseDto {
  @ApiProperty({ example: '2d89af0c-c685-4c48-a8c6-1a9b2fd8d8f5' })
  id: string;

  @ApiProperty({ example: 'Usuario Prueba' })
  name: string;

  @ApiProperty({ example: 'usuario@mail.com' })
  email: string;

  @ApiProperty({ example: 40123456 })
  dni?: number;

  @ApiProperty({ example: 1123456789 })
  phone?: number;

  @ApiPropertyOptional({ example: 'Calle Falsa 123' })
  address?: string;

  @ApiProperty({ enum: Role, example: Role.User })
  role: Role;
}
