import { applyDecorators, HttpCode, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

export function uploadToCloudinaryDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza la imagen solicitada',
      description: 'Actualiza la imagen por id',
    }),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: 'Se actualizo la imagen exitosamente',
    }),
    ApiResponse({
      status: 400,
      description: 'Empresa con ese id no fue encontrada',
    })
  );
}

export function updateFileUserDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Guarda la imagen solicitada',
      description: 'Actualiza la imagen por id',
    }),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: 'Se guardo la imagen exitosamente',
    }),
    ApiResponse({
      status: 400,
      description: 'La imagen no se pudo guardar',
    }),
  );
}
