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

  // Crear empresa
  async createCompany(data: Partial<Company>) {
    const company = this.companyRepo.create(data);
    return this.companyRepo.save(company);
  }

  // Listar todas las empresas con sus documentos
  async findAll() {
    return this.companyRepo.find({
      relations: { documents: true },
    });
  }

  // Buscar una empresa por ID con sus documentos
  async findOne(id: string) {
    return this.companyRepo.findOne({
      where: { id },
      relations: { documents: true },
    });
  }
}
