import { applyDecorators, HttpCode } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function createCompaniesDecorator() {
    return applyDecorators(
        ApiOperation({summary: 'Crea una companía'}),
                HttpCode(200),
                ApiResponse({status: 200, description: 'Companía creada con éxito'}),
                ApiResponse({status: 400, description: 'Empresas ya existen, seeder no ejecutado'})
    )
}

export function findAllCompaniesDecorator() {
    return applyDecorators(
        ApiOperation({summary: 'Trae todas las empresas'}),
                HttpCode(200),
                ApiResponse({status: 200, description: 'Companías obtenidas con éxito'}),
                ApiResponse({status: 400, description: 'Error al obtener las companías'})
    )
}

export function findCompaniesByIdDecorator() {
    return applyDecorators(
        ApiOperation({summary: 'Trae las empresas mediante su Id'}),
                HttpCode(200),
                ApiResponse({status: 200, description: 'Companías obtenidas con éxito'}),
                ApiResponse({status: 400, description: 'Error al obtener las companías mediante su id'})
    )
}