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
import { RespondRouteRequestDto } from './dto/route-request.dto';
import { RouteRequestResponseDto } from './dto/route-request-response.dto';
import { RespondScheduleRequestDto } from './dto/schedule-request.dto';
import { ScheduleRequestResponseDto } from './dto/schedule-request-response.dto';

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

  @Roles(Role.superAdmin)
  @Get('route-requests')
  @ApiOperation({ summary: 'Lista las solicitudes pendientes de rutas' })
  @ApiOkResponse({ type: RouteRequestResponseDto, isArray: true })
  async getRouteRequests(): Promise<RouteRequestResponseDto[]> {
    return this.dashboardService.getRouteRequests();
  }

  @Roles(Role.superAdmin)
  @Post('route-requests/:id/respond')
  @ApiOperation({ summary: 'Aprueba o rechaza una solicitud de ruta' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: RouteRequestResponseDto })
  async respondRouteRequest(
    @Param('id') id: string,
    @Body() body: RespondRouteRequestDto,
  ): Promise<RouteRequestResponseDto> {
    return this.dashboardService.respondRouteRequest(id, body);
  }

  @Roles(Role.superAdmin)
  @Get('schedule-requests')
  @ApiOperation({ summary: 'Lista las solicitudes pendientes de horarios' })
  @ApiOkResponse({ type: ScheduleRequestResponseDto, isArray: true })
  async getScheduleRequests(): Promise<ScheduleRequestResponseDto[]> {
    return this.dashboardService.getScheduleRequests();
  }

  @Roles(Role.superAdmin)
  @Post('schedule-requests/:id/respond')
  @ApiOperation({ summary: 'Aprueba o rechaza una solicitud de horario' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ScheduleRequestResponseDto })
  async respondScheduleRequest(
    @Param('id') id: string,
    @Body() body: RespondScheduleRequestDto,
  ): Promise<ScheduleRequestResponseDto> {
    return this.dashboardService.respondScheduleRequest(id, body);
  }

  // Aceptar/denegar solicitud de empresa
  @Roles(Role.superAdmin)
  @Post('company-requests/:id/respond')
  @ApiOperation({
    summary: 'Responde una solicitud de empresa',
    description:
      'Aprueba o rechaza una solicitud de empresa. Si la solicitud tiene un usuario asociado, el sistema intenta enviar un email notificando la decisión.',
  })
  @ApiParam({
    name: 'id',
    example: '8b5dc01d-3124-4f1a-a876-b0a8f3361302',
  })
  @ApiOkResponse({
    type: CompanyRequestResponseDto,
    description:
      'Solicitud respondida correctamente. Validar también el email de aprobación o rechazo en el destinatario y en los logs de Brevo.',
  })
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
  @ApiOperation({
    summary: 'Cambia el rol de un usuario',
    description:
      'Actualiza el rol del usuario indicado. Si el cambio es exitoso, el sistema intenta enviar un email notificando el nuevo rol.',
  })
  @ApiParam({
    name: 'id',
    example: '2d89af0c-c685-4c48-a8c6-1a9b2fd8d8f5',
  })
  @ApiOkResponse({
    type: DashboardUserResponseDto,
    description:
      'Rol actualizado correctamente. Validar también el email de cambio de rol en el destinatario y en los logs de Brevo.',
  })
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
