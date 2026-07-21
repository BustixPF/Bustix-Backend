import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompanies1784665219444 implements MigrationInterface {
    name = 'CreateCompanies1784665219444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "filename" character varying NOT NULL, "mimetype" character varying NOT NULL, "companyId" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "COMPANIES" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "nit" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "UQ_dbc16d85aab3352c0df586c3342" UNIQUE ("name"), CONSTRAINT "PK_0b92670b8a957e772147ac68674" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin', 'superAdmin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(80) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(60) NOT NULL, "dni" integer NOT NULL, "phone" integer NOT NULL, "address" text, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350" UNIQUE ("dni"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_6f0a96a5bd71aab8902c8c678b1" FOREIGN KEY ("companyId") REFERENCES "COMPANIES"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_6f0a96a5bd71aab8902c8c678b1"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "COMPANIES"`);
        await queryRunner.query(`DROP TABLE "documents"`);
    }

}
