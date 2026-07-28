import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

export const environment = {
  HOST: process.env.HOST || 'localhost',
  PORT: Number(process.env.PORT) || 3000,

  DB_NAME: process.env.DB_NAME || 'bustix_db',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_USERNAME: process.env.DB_USERNAME || 'user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',

  NODE_ENV: process.env.NODE_ENV || 'development',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  JWT_SECRET: process.env.JWT_SECRET || 'secret',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  BACKEND_URL:
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`,

  MAIL_HOST: process.env.MAIL_HOST || '',
  MAIL_PORT: Number(process.env.MAIL_PORT) || 587,
  MAIL_USER: process.env.MAIL_USER || '',
  MAIL_PASSWORD: process.env.MAIL_PASSWORD || '',
  MAIL_FROM: process.env.MAIL_FROM || '',
  MAIL_SECURE: process.env.MAIL_SECURE === 'true',
};
