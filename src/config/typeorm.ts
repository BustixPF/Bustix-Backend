import { registerAs } from '@nestjs/config';
import { environment } from './environment';
import { DataSource, DataSourceOptions } from 'typeorm';

const config = {
  type: 'postgres',
  database: environment.DB_NAME,
  host: environment.DB_HOST,
  // host: 'postgresdb',
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  logging: false,
  synchronize: true,
  dropSchema: true,
};

export const typeOrmConfig = registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config as DataSourceOptions);
