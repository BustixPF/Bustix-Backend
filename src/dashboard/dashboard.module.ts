import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SuperadminController } from './superadmin.controller';
import { AdminController } from './admin.controller';
import { UserController } from './user.controller';
import { Ticket } from '../tickets/entities/ticket.entity';
import { RouteRequest } from './entities/route-request.entity';
import { CompanyRequest } from './entities/company-request.entity';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ScheduleRequest } from './entities/schedule-request.entity';
import { RoutesModule } from '../routes/routes.module';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      RouteRequest,
      CompanyRequest,
      ScheduleRequest,
    ]),
    UsersModule,
    CompaniesModule,
    AuthModule,
    NotificationsModule,
    RoutesModule,
    TripsModule,
  ],
  controllers: [
    DashboardController,
    SuperadminController,
    AdminController,
    UserController,
  ],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
