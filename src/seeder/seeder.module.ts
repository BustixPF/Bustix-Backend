import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Route } from '../routes/entities/routes.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Seat } from '../trips/entities/seat.entity';
import { seedCompanies } from './companies.seeder';
import { seedRoutes } from './routes.seeder';
import { seedTrips } from './trips.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Route, Trip, Seat])],
})
export class SeederModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    console.log('🚀 Ejecutando seeders en orden...');

    await seedCompanies(this.dataSource);
    await seedRoutes(this.dataSource);
    await seedTrips(this.dataSource);

    console.log('✅ Todos los seeders ejecutados correctamente');
  }
}
