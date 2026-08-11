import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm';
import { CompaniesModule } from './companies/companies.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentsModule } from './payments/payments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripsModule } from './trips/trips.module';
import { TicketsModule } from './tickets/tickets.module';
import { RoutesModule } from './routes/routes.module';
import { SeederModule } from './seeder/seeder.module';
import { MetricsModule } from './metrics/metric.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AuditModule } from './auditLog/auditLog.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),

    // 👇 Habilita cron jobs y tareas programadas
    ScheduleModule.forRoot(),

    // Configuración de TypeORM con variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return configService.get<TypeOrmModuleOptions>('typeorm')!;
      },
    }),

    // Módulos de la aplicación
    AuthModule,
    CompaniesModule,
    FileUploadModule,
    DashboardModule,
    PaymentsModule,
    TripsModule,
    TicketsModule,
    RoutesModule,
    SeederModule,
    ChatbotModule,
    MetricsModule,
    AuditModule,
    HealthModule, // 👈 Se agrega para que TypeORM cargue la entidad e instancie la tabla audit_logs
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}