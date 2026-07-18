import { environment } from './environment';
import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';

export const config = {
  type: 'postgres',
  host: environment.DB_HOST || 'localhost',
  port: Number(environment.DB_PORT) || 5432,
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: [User],
  migrations: ['dist/migration/*.js'],
  synchronize: true, // ⚠️ solo en desarrollo. En producción usar migraciones (false).
  logging: false,
  dropSchema: false,
};

export const typeOrmConfig = registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
