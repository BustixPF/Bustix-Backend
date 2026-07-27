import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async createCompany(data: CreateCompanyDto): Promise<Company> {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const company = this.companyRepo.create({
      ...data,
      password: hashedPassword,
    });

    return this.companyRepo.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({ relations: { documents: true } });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: { documents: true },
    });
    if (!company) {
      throw new BadRequestException('Compañía no encontrada');
    }
    return company;
  }

  async updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.companyRepo.update(id, data);
    return this.findOne(id);
  }
}
