import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CompanyStatus } from '../common/company-status.enum';

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

  // Actualizar empresa (ahora siempre devuelve Company)
  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    await this.companyRepo.update(id, data);
    const updated = await this.companyRepo.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Compañía con id ${id} no encontrada`);
    }
    return updated;
  }

  // Actualizar solo el estado de la empresa
  async updateCompanyStatus(
    id: string,
    status: CompanyStatus,
    rejectionReason?: string,
  ): Promise<Company> {
    await this.companyRepo.update(id, {
      status,
      rejectionReason:
        status === CompanyStatus.REJECTED ? rejectionReason : null,
    });
    const updated = await this.companyRepo.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Compañía con id ${id} no encontrada`);
    }
    return updated;
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
