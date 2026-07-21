"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const environment_1 = require("./config/environment");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('BusTix API')
        .setDescription('Aplicacion creada con NestJS')
        .setVersion('1.0.0')
        .addBearerAuth()
        .setContact('BusTix', 'https://github.com/BustixPF/Bustix-Backend', 'bustix@gmail.com')
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, documentFactory);
    const HOST = environment_1.environment.HOST;
    const PORT = environment_1.environment.PORT;
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Servidor escuchando en http://${HOST}:${PORT}/`);
}
bootstrap();
//# sourceMappingURL=main.js.map