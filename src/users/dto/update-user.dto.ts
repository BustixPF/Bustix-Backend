import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Al actualizar, no tiene sentido pedir confirmPassword de nuevo
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['confirmPassword'] as const),
) {}
