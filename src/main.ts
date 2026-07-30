import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  // Configuración flexible de CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Permite peticiones sin origin (como Postman/Swagger) o dominis de Vercel y Localhost
      if (
        !origin ||
        origin.includes('vercel.app') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, true); // O cambiar por new Error('Not allowed by CORS') si querés restricción estricta
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