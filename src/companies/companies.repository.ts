import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { allCompanies } from '../utils/companies.data';

@Injectable()
export class CompaniesRepository implements OnModuleInit {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async onModuleInit() {
    const count = await this.companyRepo.count();
    if (count === 0) {
      await Promise.all(
        allCompanies.map(async (element) => {
          const company = this.companyRepo.create({
            name: element.name,
            nit: element.nit,
            email: element.email,
          });

          await this.companyRepo
            .createQueryBuilder()
            .insert()
            .into(Company)
            .values(company)
            .orUpdate(['nit', 'email'], ['name'])
            .execute();
        }),
      );
      console.log('✅ Empresas de prueba cargadas automáticamente');
    } else {
      console.log('ℹ️ Empresas ya existen, seeder no ejecutado');
    }
  }
}
