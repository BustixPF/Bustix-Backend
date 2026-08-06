import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function signUpDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra un usuario',
      description:
        'Crea una cuenta nueva. Si el registro es exitoso, el sistema intenta enviar un email de bienvenida usando la API de Brevo.',
    }),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description:
        'Usuario registrado con éxito. Validar también que llegue el email de bienvenida al destinatario.',
    }),
    ApiResponse({ status: 400, description: 'Las contraseñas no coinciden' }),
  );
}

export function signInDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Loguea un usuario',
      description: 'Inicia sesión y devuelve un token JWT.',
    }),
    HttpCode(200),
    ApiResponse({ status: 200, description: 'Logueado con éxito' }),
    ApiResponse({ status: 400, description: 'Email o password incorrectos' }),
  );
}
