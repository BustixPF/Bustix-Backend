import { DataSource } from 'typeorm';
export declare const typeOrmConfig: (() => {
    type: string;
    database: string;
    host: string;
    port: number;
    username: string;
    password: string;
    entities: string[];
    migrations: string[];
    autoLoadEntities: boolean;
    logging: boolean;
    synchronize: boolean;
    dropSchema: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    type: string;
    database: string;
    host: string;
    port: number;
    username: string;
    password: string;
    entities: string[];
    migrations: string[];
    autoLoadEntities: boolean;
    logging: boolean;
    synchronize: boolean;
    dropSchema: boolean;
}>;
export declare const connectionSource: DataSource;
