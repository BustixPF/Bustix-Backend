import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  // Buscar empresa por NIT
  async findByNit(nit: string): Promise<Company | null> {
    return this.companyRepo.findOne({ where: { nit } });
  }

  // Buscar empresa por email
  async findByEmail(email: string): Promise<Company | null> {
    return this.companyRepo.findOne({ where: { email } });
  }

  // Crear empresa
  async createCompany(data: Partial<Company>): Promise<Company> {
    const company = this.companyRepo.create(data);
    return this.companyRepo.save(company);
  }

  // Actualizar empresa
  async updateCompany(
    id: string,
    data: Partial<Company>,
  ): Promise<Company | null> {
    await this.companyRepo.update(id, data);
    return this.companyRepo.findOne({ where: { id } });
  }

  // Listar todas las empresas
  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({ relations: { documents: true } });
  }

  // Buscar empresa por ID
  async findOne(id: string): Promise<Company | null> {
    return this.companyRepo.findOne({
      where: { id },
      relations: { documents: true },
    });
  }
}
