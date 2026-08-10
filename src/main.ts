import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  if (
    (environment.NODE_ENV === 'production' ||
      environment.NODE_ENV === 'produccion') &&
    environment.JWT_SECRET.length < 32
  ) {
    throw new Error(
      'JWT_SECRET debe tener al menos 32 caracteres en producción',
    );
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  const configuredFrontend = environment.FRONTEND_URL.replace(/\/$/, '');
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const normalizedOrigin = origin?.replace(/\/$/, '');
      const isLocalDevelopment =
        environment.NODE_ENV !== 'production' &&
        normalizedOrigin != null &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);

      if (
        !origin ||
        normalizedOrigin === configuredFrontend ||
        isLocalDevelopment
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origin no permitido por CORS'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('BusTix API')
    .setDescription('Documentación de la API de BusTix')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT || environment.PORT || 3000;

  await app.listen(PORT, '0.0.0.0');
  console.log(`Servidor activo en el puerto: ${PORT}`);
}

void bootstrap();
