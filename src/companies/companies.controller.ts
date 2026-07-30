import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { CompanyStatus } from '../common/company-status.enum';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva empresa' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada exitosamente',
    type: Company,
  })
  @ApiResponse({
    status: 400,
    description: 'Error en validación o contraseñas no coinciden',
  })
  async create(@Body() body: CreateCompanyDto): Promise<Company> {
    return this.companiesService.createCompany(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las empresas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de empresas',
    type: [Company],
  })
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una empresa' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.updateCompany(id, body);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprobar empresa (cambiar estado a APPROVED)' })
  @ApiResponse({ status: 200, description: 'Empresa aprobada', type: Company })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async approve(@Param('id') id: string): Promise<Company> {
    return this.companiesService.updateCompanyStatus(
      id,
      CompanyStatus.APPROVED,
    );
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar empresa (cambiar estado a REJECTED)' })
  @ApiResponse({ status: 200, description: 'Empresa rechazada', type: Company })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async reject(@Param('id') id: string): Promise<Company> {
    return this.companiesService.updateCompanyStatus(
      id,
      CompanyStatus.REJECTED,
    );
  }
}
