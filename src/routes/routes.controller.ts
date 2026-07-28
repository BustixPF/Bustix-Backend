import { Controller, Get } from '@nestjs/common';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  // Endpoint para ejecutar el seeder
  @Get('seeder')
  async seedRoutes() {
    return this.routesService.seedRoutes();
  }

  // Endpoint para listar todas las rutas
  @Get()
  async findAll() {
    return this.routesService.findAll();
  }
}
