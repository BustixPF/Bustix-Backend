import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), NotificationsModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService, TypeOrmModule],
})
export class CompaniesModule {}
