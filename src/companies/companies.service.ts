import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepo: CompaniesRepository) {}

  async createCompany(data: CreateCompanyDto): Promise<Company> {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.companiesRepo.createCompany({
      ...data,
      password: hashedPassword,
    });
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepo.findAll();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepo.findOne(id);
    if (!company) {
      throw new BadRequestException('Compañía no encontrada');
    }
    return company;
  }

  async updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const updated = await this.companiesRepo.updateCompany(id, data);
    if (!updated) {
      throw new BadRequestException('Compañía no encontrada');
    }
    return updated;
  }
}
