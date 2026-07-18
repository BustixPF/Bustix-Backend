import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { allCompanies } from '../utils/companies.data';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async createCompany(data: Partial<Company>) {
    const company = this.companyRepo.create(data);
    return this.companyRepo.save(company);
  }

  async findAll() {
    return this.companyRepo.find({
      relations: {
        documents: true,
      },
    });
  }

  async findOne(id: string) {
    return this.companyRepo.findOne({
      where: { id },
      relations: {
        documents: true,
      },
    });
  }

  //método para cargar empresas ficticias
  async seedCompanies(): Promise<string> {
    await Promise.all(
      allCompanies.map(async (element) => {
        const company = this.companyRepo.create({
          name: element.name,
          nit: element.nit,
          contactEmail: element.contactEmail,
        });

        await this.companyRepo
          .createQueryBuilder()
          .insert()
          .into(Company)
          .values(company)
          .orUpdate(['nit', 'contactEmail'], ['name'])
          .execute();
      }),
    );

    return 'Empresas ficticias cargadas';
  }
}
