import { Injectable } from '@nestjs/common';
import { RoutesRepository } from './routes.repository';
import { Route } from './entities/routes.entity';

@Injectable()
export class RoutesService {
  constructor(private readonly routesRepository: RoutesRepository) {}

  // Obtener todas las rutas
  async findAll(): Promise<Route[]> {
    return this.routesRepository.findAll();
  }

  // Crear una nueva ruta
  async create(routeData: Partial<Route>): Promise<Route> {
    return this.routesRepository.create(routeData);
  }

  // Buscar una ruta por ID
  async findById(id: number): Promise<Route | null> {
    return this.routesRepository.findById(id);
  }

  // Actualizar una ruta existente
  async update(id: number, routeData: Partial<Route>): Promise<Route | null> {
    return this.routesRepository.update(id, routeData);
  }

  // Eliminar una ruta
  async delete(id: number): Promise<void> {
    return this.routesRepository.delete(id);
  }
}
