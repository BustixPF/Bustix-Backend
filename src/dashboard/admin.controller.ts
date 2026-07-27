import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/roles.enum';
import { RouteRequestDto } from './dto/route-request.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { RouteRequestResponseDto } from './dto/route-request-response.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { SalesQueryDto } from './dto/sales-query.dto';

// Controlador para endpoints del Admin (dueño de empresa)
@ApiTags('Dashboard Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard/admin')
export class AdminController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Solicitar agregar una nueva ruta con paradas
  @Roles(Role.Admin)
  @Post('routes')
  @ApiOperation({ summary: 'Solicita el alta de una ruta' })
  @ApiOkResponse({ type: RouteRequestResponseDto })
  @ApiBadRequestResponse({ description: 'Datos de ruta invalidos' })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async requestAddRoute(
    @Req() request: AuthenticatedRequest,
    @Body() payload: RouteRequestDto,
  ): Promise<RouteRequestResponseDto> {
    const userId = request.user!.id;
    return this.dashboardService.requestRoute(userId, payload);
  }

  // Solicitar eliminar una ruta
  @Roles(Role.Admin)
  @Delete('routes/:id')
  @ApiOperation({ summary: 'Solicita la baja de una ruta' })
  @ApiParam({ name: 'id', example: 'route-123' })
  @ApiOkResponse({ type: RouteRequestResponseDto })
  @ApiBadRequestResponse({ description: 'Solicitud invalida' })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async requestDeleteRoute(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<RouteRequestResponseDto> {
    const userId = request.user!.id;
    return this.dashboardService.deleteRouteRequest(userId, id);
  }

  // Historial de ventas de la empresa (filtros: usuario, destino, fecha)
  @Roles(Role.Admin)
  @Get('sales-history')
  @ApiOperation({ summary: 'Obtiene el historial de ventas' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'destination', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiOkResponse({ type: SaleResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async getSalesHistory(
    @Query() query: SalesQueryDto,
  ): Promise<SaleResponseDto[]> {
    return this.dashboardService.getSales(query);
  }
}
