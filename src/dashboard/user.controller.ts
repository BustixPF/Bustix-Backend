import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/roles.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { DashboardUserResponseDto } from './dto/dashboard-user-response.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

// Controlador para endpoints del Usuario
@ApiTags('Dashboard User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard/user')
export class UserController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Historial de pasajes comprados por el usuario
  @Roles(Role.User, Role.Admin, Role.superAdmin)
  @Get('tickets')
  @ApiOperation({ summary: 'Obtiene los tickets del usuario autenticado' })
  @ApiOkResponse({ type: TicketResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async getTickets(
    @Req() request: AuthenticatedRequest,
  ): Promise<TicketResponseDto[]> {
    return this.dashboardService.getUserTickets(request.user!.id);
  }

  // Obtener datos del perfil del usuario
  @Roles(Role.User, Role.Admin, Role.superAdmin)
  @Get('profile')
  @ApiOperation({ summary: 'Obtiene el perfil del usuario autenticado' })
  @ApiOkResponse({ type: DashboardUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async getProfile(
    @Req() request: AuthenticatedRequest,
  ): Promise<DashboardUserResponseDto> {
    return this.dashboardService.getUserProfile(request.user!.id);
  }

  // Actualizar datos del perfil del usuario
  @Roles(Role.User, Role.Admin, Role.superAdmin)
  @Put('profile')
  @ApiOperation({ summary: 'Actualiza el perfil del usuario autenticado' })
  @ApiOkResponse({ type: DashboardUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o invalido' })
  @ApiForbiddenResponse({ description: 'Rol insuficiente' })
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ): Promise<DashboardUserResponseDto> {
    return this.dashboardService.updateUserProfile(request.user!.id, body);
  }
}
