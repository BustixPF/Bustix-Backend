import { registerAs } from '@nestjs/config';
import { environment } from './environment';
import { DataSource, DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'postgres',
  host: environment.DB_HOST,
  port: environment.DB_PORT,
  url: process.env.DATABASE_URL,
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  ssl:
    process.env.DB_SSLMODE === 'require'
      ? { rejectUnauthorized: false }
      : false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  logging: false,
  synchronize: true,
  dropSchema: false,
};

export const typeOrmConfig = registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config);
