import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

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
}
