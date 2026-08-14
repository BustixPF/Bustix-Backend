import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from './companies.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../auditLog/auditLog.module';
import { User } from '../users/entities/user.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User]),
    AuditModule,
    NotificationsModule,
    FileUploadModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService, TypeOrmModule],
})
export class CompaniesModule {}
