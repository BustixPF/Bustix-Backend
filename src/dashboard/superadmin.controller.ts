import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/roles.enum';
import { RespondCompanyRequestDto } from './dto/respond-company-request.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { DashboardCompanyDetailResponseDto } from './dto/dashboard-company-detail-response.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import { DashboardUserResponseDto } from './dto/dashboard-user-response.dto';

// Controlador para endpoints que usa SuperAdmin
@ApiTags('Dashboard SuperAdmin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard/superadmin')
export class SuperadminController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.superAdmin)
  @Get('companies')
  @ApiOperation({ summary: 'Obtiene todas las empresas con sus documentos' })
  @ApiOkResponse({ type: DashboardCompanyDetailResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async getCompanies(): Promise<DashboardCompanyDetailResponseDto[]> {
    return this.dashboardService.getAllCompanies();
  }

  @Roles(Role.superAdmin)
  @Get('sales')
  @ApiOperation({ summary: 'Obtiene todas las ventas del sistema' })
  @ApiOkResponse({ type: SaleResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async getSales(): Promise<SaleResponseDto[]> {
    return this.dashboardService.getSales();
  }

  @Roles(Role.superAdmin)
  @Get('company-requests')
  @ApiOperation({ summary: 'Lista las solicitudes pendientes de empresas' })
  @ApiOkResponse({ type: CompanyRequestResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async getCompanyRequests(): Promise<CompanyRequestResponseDto[]> {
    return this.dashboardService.getCompanyRequests();
  }

  // Aceptar/denegar solicitud de empresa
  @Roles(Role.superAdmin)
  @Post('company-requests/:id/respond')
  @ApiOperation({ summary: 'Responde una solicitud de empresa' })
  @ApiParam({
    name: 'id',
    example: '8b5dc01d-3124-4f1a-a876-b0a8f3361302',
  })
  @ApiOkResponse({ type: CompanyRequestResponseDto })
  @ApiBadRequestResponse({ description: 'La solicitud ya fue procesada' })
  @ApiNotFoundResponse({ description: 'Solicitud no encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async respondCompanyRequest(
    @Param('id') id: string,
    @Body() body: RespondCompanyRequestDto,
  ): Promise<CompanyRequestResponseDto> {
    return this.dashboardService.respondCompanyRequest(id, body);
  }

  // Cambiar rol de un usuario
  @Roles(Role.superAdmin)
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Cambia el rol de un usuario' })
  @ApiParam({
    name: 'id',
    example: '2d89af0c-c685-4c48-a8c6-1a9b2fd8d8f5',
  })
  @ApiOkResponse({ type: DashboardUserResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async changeUserRole(
    @Param('id') id: string,
    @Body() body: ChangeRoleDto,
  ): Promise<DashboardUserResponseDto> {
    return this.dashboardService.changeUserRole(id, body.role);
  }
}
