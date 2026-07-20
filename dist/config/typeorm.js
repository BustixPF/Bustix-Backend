"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionSource = exports.typeOrmConfig = exports.config = void 0;
const environment_1 = require("./environment");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
exports.config = {
    type: 'postgres',
    host: environment_1.environment.DB_HOST || 'localhost',
    port: Number(environment_1.environment.DB_PORT) || 5432,
    username: environment_1.environment.DB_USERNAME,
    password: environment_1.environment.DB_PASSWORD,
    database: environment_1.environment.DB_NAME,
    entities: [user_entity_1.User],
    migrations: ['dist/migration/*.js'],
    synchronize: true,
    logging: false,
    dropSchema: false,
};
exports.typeOrmConfig = (0, config_1.registerAs)('typeorm', () => exports.config);
exports.connectionSource = new typeorm_1.DataSource(exports.config);
//# sourceMappingURL=typeorm.js.map