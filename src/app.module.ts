import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm';

import { CompaniesModule } from './companies/companies.module';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    // Config global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),

    // Inicialización de TypeORM con config
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return configService.get<TypeOrmModuleOptions>('typeorm')!;
      },
    }),

    //módulos de negocio
    CompaniesModule,
    FileUploadModule,
  ],
})
export class AppModule {}
