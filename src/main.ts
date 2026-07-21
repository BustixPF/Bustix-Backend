import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
