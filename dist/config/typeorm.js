"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionSource = exports.typeOrmConfig = void 0;
const config_1 = require("@nestjs/config");
const environment_1 = require("./environment");
const typeorm_1 = require("typeorm");
const config = {
    type: 'postgres',
    database: environment_1.environment.DB_NAME,
    host: environment_1.environment.DB_HOST,
    port: Number(environment_1.environment.DB_PORT),
    username: environment_1.environment.DB_USERNAME,
    password: environment_1.environment.DB_PASSWORD,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    logging: false,
    synchronize: true,
    dropSchema: true,
};
exports.typeOrmConfig = (0, config_1.registerAs)('typeorm', () => config);
exports.connectionSource = new typeorm_1.DataSource(config);
//# sourceMappingURL=typeorm.js.map