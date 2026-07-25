import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { environment } from './config/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔑 Configuración de CORS según entorno
  app.enableCors({
    origin:
      environment.NODE_ENV === 'produccion'
        ? 'https://tu-frontend.vercel.app' // dominio de tu frontend en Vercel
        : 'http://localhost:3001', // frontend local
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('BusTix API')
    .setDescription('Aplicacion creada con NestJS')
    .setVersion('1.0.0')
    .addBearerAuth()
    .setContact(
      'BusTix',
      'https://github.com/BustixPF/Bustix-Backend',
      'bustix@gmail.com',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const HOST = environment.HOST;
  const PORT = environment.PORT;

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servidor escuchando en http://${HOST}:${PORT}/`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
