import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class SendMessageDto {
  /** Mensaje del usuario para el chatbot @example '¿Cómo compro un pasaje?' */
  @IsString()
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MaxLength(1000, {
    message: 'El mensaje no puede tener más de 1000 caracteres',
  })
  message: string;

  /** Historial previo de la conversación (opcional), para mantener contexto */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}
