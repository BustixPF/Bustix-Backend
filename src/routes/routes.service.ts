import { Injectable } from '@nestjs/common';
import { RoutesRepository } from './routes.repository';
import { Route } from './entities/routes.entity';

@Injectable()
export class RoutesService {
  constructor(private readonly routesRepository: RoutesRepository) {}

  async findAll(): Promise<Route[]> {
    return this.routesRepository.findAll();
  }

  async seedRoutes() {
    return this.routesRepository.seedRoutes();
  }
}
