import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { ApiBearerAuth, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import {
  CreateCompanyDto,
  RejectCompanyDto,
  UpdateCompanyDto,
} from './dto/company.dto';
import { CompanyStatus } from '../common/company-status.enum';
import {
  createCompaniesDecorator,
  findAllCompaniesDecorator,
  findCompaniesByIdDecorator,
  updateCompanyDecorator,
  approveCompanyDecorator,
  rejectCompanyDecorator,
} from './companies.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/roles.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateCompanyStatusDto } from './dto/update-company.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @createCompaniesDecorator()
  @ApiBody({ type: CreateCompanyDto })
  async create(@Body() body: CreateCompanyDto): Promise<Company> {
    return this.companiesService.createCompany(body);
  }

  @Get()
  @findAllCompaniesDecorator()
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  // 1. RUTAS ESTÁTICAS PRIMERO
  @Get('pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin, Role.Admin)
  @ApiOperation({ summary: 'Obtener empresas con solicitudes pendientes de aprobación (SuperAdmin)' })
  getPendingCompanies() {
    return this.companiesService.findPendingCompanies();
  }

  // 2. RUTAS DE ACCIÓN/ESTADO ESPECÍFICAS
  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin, Role.Admin)
  @ApiOperation({ summary: 'Aprobar o rechazar la solicitud de una empresa (SuperAdmin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyStatusDto,
  ) {
    return this.companiesService.updateCompanyStatus(id, dto.status);
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @approveCompanyDecorator()
  async approve(@Param('id') id: string) {
    return this.companiesService.updateCompanyStatus(
      id,
      CompanyStatus.APPROVED,
    );
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @rejectCompanyDecorator()
  async reject(
    @Param('id') id: string,
    @Body() body: RejectCompanyDto,
  ) {
    return this.companiesService.updateCompanyStatus(
      id,
      CompanyStatus.REJECTED,
      body?.reason,
    );
  }

  // 3. RUTAS PARAMETRIZADAS GENERALES
  @Get(':id')
  @findCompaniesByIdDecorator()
  async findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @updateCompanyDecorator()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.updateCompany(id, body);
  }
}