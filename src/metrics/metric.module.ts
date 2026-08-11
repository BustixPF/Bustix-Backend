import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';

import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { MetricsService } from './metric.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Company, Ticket])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
