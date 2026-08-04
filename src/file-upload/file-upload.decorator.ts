import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  FileUploadCompanyResponseDto,
  FileUploadDto,
  FileUploadUserResponseDto,
} from './dto/file-upload.dto';

export function uploadToCloudinaryDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Subir imagen de empresa',
      description:
        'Permite subir y actualizar la imagen asociada a una empresa',
    }),
    HttpCode(201),
    ApiBody({ type: FileUploadDto }),
    ApiResponse({
      status: 201,
      description: 'Imagen subida correctamente',
      type: FileUploadCompanyResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Empresa con ese id no fue encontrada',
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 404, description: 'Empresa no encontrada' }),
  );
}

export function updateFileUserDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Subir imagen de usuario',
      description: 'Permite subir y actualizar la imagen asociada a un usuario',
    }),
    HttpCode(201),
    ApiBody({ type: FileUploadDto }),
    ApiResponse({
      status: 201,
      description: 'Imagen subida correctamente',
      type: FileUploadUserResponseDto,
    }),
    ApiResponse({ status: 400, description: 'La imagen no se pudo guardar' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 404, description: 'Usuario no encontrado' }),
  );
}
