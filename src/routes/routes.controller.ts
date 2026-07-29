import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Route } from './entities/routes.entity';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  // ✅ Listar todas las rutas
  @Get()
  async findAll(): Promise<Route[]> {
    return this.routesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Route | null> {
    return this.routesService.findById(id);
  }

  @Post()
  async create(@Body() routeData: Partial<Route>): Promise<Route> {
    return this.routesService.create(routeData);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() routeData: Partial<Route>,
  ): Promise<Route | null> {
    return this.routesService.update(id, routeData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.routesService.delete(id);
  }
}
