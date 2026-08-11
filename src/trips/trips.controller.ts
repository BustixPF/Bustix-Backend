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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @Get()
  findAll() {
    return this.tripsService.findAll();
  }

  @Get('upcoming')
  getUpcomingTrips() {
    return this.tripsService.getUpcomingTrips();
  }

  @Get(':id/seats')
  findAvailableSeats(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findAvailableSeats(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
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
