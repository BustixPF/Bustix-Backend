import { applyDecorators, HttpCode, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export function createUsersDecorator() {
  return applyDecorators(
    ApiOperation({
    summary: 'Crear un nuevo usuario',
    }),
    ApiResponse({ status: 201, description: 'Usuario creado correctamente' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    HttpCode(201),
  );
}

export function getAllUsersDecorator() {
  return applyDecorators(
    ApiOperation({
    summary: 'Listar usuarios (paginado)',
      description:
        'Recibe la lista por QueryParams, limit(cantidad de usuarios de la pagina) y page (pagina de la lista)',
    }),
    ApiResponse({ status: 200, description: 'Listado de usuarios' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    HttpCode(200),
  );
}

export function getUsersByIdDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un usuario por ID' }),
    ApiResponse({
      status: 200,
      description: 'Todos los usuarios recibidos de manera exitosa',
    }),
    ApiResponse({
      status: 400,
      description: 'No se encontro el usuario con ese id',
    }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'el id del usuario que se quiere obtener',
      schema: { type: 'string', format: 'UUID' },
    }),
    HttpCode(200),
    ApiBearerAuth(),
  );
}

export function updateUsersDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza un usuario',
      description: 'Realiza un cambio en los datos del usuario',
    }),
    ApiResponse({
      status: 201,
      description: 'El usuario fue actualizado exitosamente',
    }),
    ApiResponse({ status: 404, description: 'El usuario no fue encontrado' }),
    ApiResponse({
      status: 404,
      description: 'El usuario no se pudo actualizar',
    }),
    ApiResponse({ status: 409, description: 'El email ya esta en uso' }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'UUID del usuario a modificar',
      schema: { type: 'string', format: 'string' },
    }),
    ApiBearerAuth(),
    HttpCode(200)
  );
}
