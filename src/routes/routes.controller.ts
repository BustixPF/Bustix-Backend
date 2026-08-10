import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Route } from './entities/routes.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/roles.enum';

// Importamos los decoradores de documentación
import {
  FindAllRoutesDoc,
  FindRouteByIdDoc,
  CreateRouteDoc,
  UpdateRouteDoc,
  DeleteRouteDoc,
} from './routes.decorator';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @FindAllRoutesDoc()
  async findAll(): Promise<Route[]> {
    return this.routesService.findAll();
  }

  @Get(':id')
  @FindRouteByIdDoc()
  async findById(@Param('id') id: number): Promise<Route | null> {
    return this.routesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @CreateRouteDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  async create(@Body() routeData: Partial<Route>): Promise<Route> {
    return this.routesService.create(routeData);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UpdateRouteDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  async update(
    @Param('id') id: number,
    @Body() routeData: Partial<Route>,
  ): Promise<Route | null> {
    return this.routesService.update(id, routeData);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @DeleteRouteDoc()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superAdmin)
  async delete(@Param('id') id: number): Promise<void> {
    return this.routesService.delete(id);
  }
}
