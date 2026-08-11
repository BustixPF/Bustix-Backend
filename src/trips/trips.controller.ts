import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/roles.enum';
import { ForbiddenException, Req } from '@nestjs/common';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @ApiOperation({ summary: 'Crear un nuevo viaje (SuperAdmin)' })
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los viajes' })
  findAll() {
    return this.tripsService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obtener los próximos viajes' })
  getUpcomingTrips() {
    return this.tripsService.getUpcomingTrips();
  }

  @Get('superadmin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @ApiOperation({ summary: 'Obtener todos los viajes con relaciones y ocupación (SuperAdmin)' })
  findAllForSuperAdmin() {
    return this.tripsService.findAllForSuperAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un viaje por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Obtener asientos disponibles de un viaje' })
  findAvailableSeats(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findAvailableSeats(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  @ApiOperation({ summary: 'Actualizar el estado o cancelar un viaje (SuperAdmin)' })
  @ApiBody({ type: UpdateTripStatusDto })
  async updateStatusBySuperAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTripStatusDto: UpdateTripStatusDto,
  ) {
    return this.tripsService.updateStatusBySuperAdmin(id, updateTripStatusDto.status);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.superAdmin)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const trip = await this.tripsService.findOne(id);
    if (!req.user) {
      throw new ForbiddenException('No autorizado');
    }
    if (
      req.user.role !== Role.superAdmin &&
      trip.companyId !== req.user.companyId
    ) {
      throw new ForbiddenException('No podés modificar viajes de otra empresa');
    }
    return this.tripsService.updateStatus(id, dto);
  }
}
