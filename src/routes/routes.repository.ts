import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { allRoutes } from '../utils/routes.data';
import { Company } from '../companies/entities/company.entity';
import { Route } from './entities/routes.entity';

@Injectable()
export class RoutesRepository implements OnModuleInit {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async onModuleInit() {
    await this.seedRoutes();
  }

  async findAll(): Promise<Route[]> {
    return this.routeRepo.find({ relations: { company: true } });
  }

  async seedRoutes() {
    const existingRoutes = await this.routeRepo.count();
    if (existingRoutes > 0) {
      console.log('ℹ️ Rutas ya existen, seeder no ejecutado');
      return;
    }

    let inserted = 0;

    for (const route of allRoutes) {
      const company = await this.companyRepo.findOne({
        where: { nit: route.nit },
      });
      if (!company) {
        console.warn(
          `Empresa con NIT ${route.nit} no encontrada, omitiendo ruta.`,
        );
        continue;
      }

      const newRoute = this.routeRepo.create({
        origin: route.origin,
        destination: route.destination,
        duration: Number(route.duration),
        price: Number(route.price),
        companyId: company.id,
      });

      await this.routeRepo.save(newRoute);
      inserted++;
    }

    console.log(`✅ Seeder de rutas ejecutado 🚍, count: ${inserted}`);
  }
}
