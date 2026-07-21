import { applyDecorators, HttpCode } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function signUpDecorator() {
    return applyDecorators(
        ApiOperation({summary: 'Registra un Usuario'}),
        HttpCode(200),
        ApiResponse({status: 200, description: 'Usuario registrado con éxito'}),
        ApiResponse({status: 400, description: 'Las contraseñas no coinciden'})
    );
}

export function signInDecorator() {
    return applyDecorators(
        ApiOperation({summary: 'Loguea un Usuario'}),
        HttpCode(200),
        ApiResponse({status: 200, description: 'Logueado con éxito'}),
        ApiResponse({status: 400, description: 'Email o password incorrectos'})
    );
}