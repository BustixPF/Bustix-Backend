import * as dotenv from 'dotenv';
dotenv.config();

export const environment = {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,

  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
};
