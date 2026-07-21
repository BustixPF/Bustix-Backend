import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

export const environment = {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,

  DB_NAME: process.env.DB_NAME || 'bustix_db',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432',
  DB_USERNAME: process.env.DB_USERNAME || 'user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  JWT_SECRET: process.env.JWT_SECRET,
};
