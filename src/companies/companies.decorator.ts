import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Company } from './entities/company.entity';
import { RejectCompanyDto, UpdateCompanyDto } from './dto/company.dto';

export function createCompaniesDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Registrar una nueva empresa' }),
    HttpCode(201),
    ApiResponse({
      status: 201,
      description: 'Empresa creada exitosamente',
      type: Company,
    }),
    ApiResponse({
      status: 400,
      description: 'Error en validación o contraseñas no coinciden',
    }),
  );
}

export function findAllCompaniesDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar empresas aprobadas' }),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: 'Listado público de empresas aprobadas',
      type: [Company],
    }),
  );
}

export function findCompaniesByIdDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener una empresa por ID' }),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: 'Empresa encontrada',
      type: Company,
    }),
    ApiResponse({ status: 404, description: 'Empresa no encontrada' }),
  );
}

export function updateCompanyDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar datos de una empresa' }),
    HttpCode(200),
    ApiBody({ type: UpdateCompanyDto }),
    ApiResponse({
      status: 200,
      description: 'Empresa actualizada',
      type: Company,
    }),
    ApiResponse({ status: 404, description: 'Empresa no encontrada' }),
  );
}

export function approveCompanyDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Aprobar empresa (cambiar estado a APPROVED)' }),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: 'Empresa aprobada',
      type: Company,
    }),
    ApiResponse({ status: 404, description: 'Empresa no encontrada' }),
  );
}

export function rejectCompanyDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Rechazar empresa (cambiar estado a REJECTED)' }),
    ApiBody({ type: RejectCompanyDto }),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: 'Empresa rechazada',
      type: Company,
    }),
    ApiResponse({ status: 404, description: 'Empresa no encontrada' }),
  );
}
