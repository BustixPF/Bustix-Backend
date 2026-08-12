import { Module } from '@nestjs/common';
import { AuditLog } from './entity/auditLog.entity';
import { AuditController } from './auditLog.controller';
import { AuditService } from './auditLog.service';
import { AuditInterceptor } from './auditLog.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor, TypeOrmModule],
})
export class AuditModule {}
