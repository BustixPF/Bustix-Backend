import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
  UseInterceptors,
  ParseUUIDPipe,
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
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { AuditInterceptor } from '../auditLog/auditLog.interceptor';
import { AuditAction } from '../auditLog/auditLog.decorator';
import { AssignAdminDto } from '../users/dto/assign-admin.dto';
import { UpdateCompanyActiveDto } from './dto/update-company-active.dto';
@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @createCompaniesDecorator()
  @ApiBody({ type: CreateCompanyDto })
  async create(@Body() body: CreateCompanyDto): Promise<Company> {
    return this.withoutPassword(
      await this.companiesService.createCompany(body),
    );
  }

  @Get()
  @findAllCompaniesDecorator()
  async findAll(): Promise<Company[]> {
    const companies = await this.companiesService.findPublicCompanies();
    return companies.map((company) => this.withoutPassword(company));
  }

  // 1. RUTAS ESTÁTICAS PRIMERO
  @Get('pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @ApiOperation({
    summary:
      'Obtener empresas con solicitudes pendientes de aprobación (SuperAdmin)',
  })
  getPendingCompanies() {
    return this.companiesService.findPendingCompanies();
  }

  // 2. RUTAS DE ACCIÓN/ESTADO ESPECÍFICAS
  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin, Role.Admin)
  @UseInterceptors(AuditInterceptor) // 👈 Interceptor
  @AuditAction('UPDATE_COMPANY_STATUS')
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
  async reject(@Param('id') id: string, @Body() body: RejectCompanyDto) {
    return this.companiesService.updateCompanyStatus(
      id,
      CompanyStatus.REJECTED,
      body?.reason,
    );
  }

  @Patch(':id/assign-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.superAdmin)
@ApiOperation({ summary: 'Vincular o reasignar un administrador a una empresa (SuperAdmin)' })
async assignAdmin(
  @Param('id', ParseUUIDPipe) companyId: string,
  @Body() dto: AssignAdminDto,
) {
  return this.companiesService.assignAdmin(companyId, dto.userId);
}
  @Patch(':id/active')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.superAdmin)
@ApiOperation({ summary: 'Suspender o activar una empresa (SuperAdmin)' })
async updateActiveState(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateCompanyActiveDto,
) {
  return this.companiesService.updateCompanyActiveState(id, dto.isActive);
}

  // 3. RUTAS PARAMETRIZADAS GENERALES
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin, Role.Admin)
  @findCompaniesByIdDecorator()
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Company> {
    this.assertCompanyAccess(req, id);
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin, Role.Admin)
  @updateCompanyDecorator()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCompanyDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Company> {
    this.assertCompanyAccess(req, id);
    return this.companiesService.updateCompany(id, body);
  }

  private assertCompanyAccess(req: AuthenticatedRequest, companyId: string) {
    if (
      req.user?.role !== Role.superAdmin &&
      req.user?.companyId !== companyId
    ) {
      throw new ForbiddenException('No podés acceder a otra empresa');
    }
  }

  private withoutPassword(company: Company): Company {
    const { password, ...safeCompany } = company;
    void password;
    return safeCompany as Company;
  }
}
