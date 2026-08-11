import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Route } from '../routes/entities/routes.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Seat } from '../trips/entities/seat.entity';
import { seedCompanies } from './companies.seeder';
import { seedRoutes } from './routes.seeder';
import { seedTrips } from './trips.seeder';
import { environment } from '../config/environment';

const SEEDER_LOCK_KEY = 'bustix-database-seeder-v1';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Route, Trip, Seat])],
})
export class SeederModule implements OnModuleInit {
  private readonly logger = new Logger(SeederModule.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (!environment.SEED_DATABASE) {
      this.logger.log(
        'Seeder omitido. Usa SEED_DATABASE=true para ejecutarlo.',
      );
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    let lockAcquired = false;

    try {
      const [lockResult] = (await queryRunner.query(
        'SELECT pg_try_advisory_lock(hashtext($1)) AS "acquired"',
        [SEEDER_LOCK_KEY],
      )) as Array<{ acquired: boolean }>;

      if (!lockResult?.acquired) {
        this.logger.warn('Otro proceso ya está ejecutando el seeder.');
        return;
      }
      lockAcquired = true;

      await queryRunner.startTransaction();
      const startedAt = Date.now();

      try {
        const companies = await seedCompanies(queryRunner.manager);
        const routes = await seedRoutes(queryRunner.manager);
        const trips = await seedTrips(queryRunner.manager);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Seeder completado en ${Date.now() - startedAt} ms: ${companies} empresas, ${routes} rutas y ${trips} viajes creados.`,
        );
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }
        throw error;
      }
    } finally {
      try {
        if (lockAcquired) {
          await queryRunner.query('SELECT pg_advisory_unlock(hashtext($1))', [
            SEEDER_LOCK_KEY,
          ]);
        }
      } finally {
        await queryRunner.release();
      }
    }
  }
}
