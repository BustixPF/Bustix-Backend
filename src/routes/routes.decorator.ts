// routes.decorator.ts
import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function FindAllRoutesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista todas las rutas',
      description: 'Obtiene todas las rutas registradas en el sistema',
    }),
    HttpCode(200),
    ApiResponse({ status: 200, description: 'Listado de rutas obtenido' }),
    ApiResponse({ status: 404, description: 'No se encontraron rutas' }),
  );
}

export function FindRouteByIdDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtiene una ruta por ID',
      description: 'Busca una ruta específica usando su identificador',
    }),
    HttpCode(200),
    ApiResponse({ status: 200, description: 'Ruta encontrada' }),
    ApiResponse({ status: 404, description: 'Ruta no encontrada' }),
  );
}

export function CreateRouteDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crea una nueva ruta',
      description: 'Registra una nueva ruta en el sistema',
    }),
    HttpCode(201),
    ApiResponse({ status: 201, description: 'Ruta creada exitosamente' }),
    ApiResponse({ status: 400, description: 'Datos inválidos para la ruta' }),
  );
}

export function UpdateRouteDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza una ruta existente',
      description: 'Modifica los datos de una ruta registrada',
    }),
    HttpCode(200),
    ApiResponse({ status: 200, description: 'Ruta actualizada exitosamente' }),
    ApiResponse({ status: 404, description: 'Ruta no encontrada' }),
  );
}

export function DeleteRouteDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Elimina una ruta',
      description: 'Borra una ruta registrada en el sistema',
    }),
    HttpCode(200),
    ApiResponse({ status: 200, description: 'Ruta eliminada exitosamente' }),
    ApiResponse({ status: 404, description: 'Ruta no encontrada' }),
  );
}
