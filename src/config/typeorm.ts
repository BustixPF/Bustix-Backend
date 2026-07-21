import { registerAs } from '@nestjs/config';
import { environment } from './environment';
import { DataSource, DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'postgres',
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  logging: false,
  synchronize: false, // ⚠️ usa migraciones en producción
  dropSchema: false, // ⚠️ evita que borre todo al reiniciar
};

export const typeOrmConfig = registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config);
