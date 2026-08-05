import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesRepository } from './routes.repository';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Company } from '../companies/entities/company.entity';
import { Route } from './entities/routes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route, Company])],
  providers: [RoutesRepository, RoutesService],
  controllers: [RoutesController],
  exports: [RoutesRepository, RoutesService],
})
export class RoutesModule {}
