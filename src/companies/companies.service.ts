import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { Company } from './entities/company.entity';
import { CompanyStatus } from '../common/company-status.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companiesRepo: CompaniesRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createCompany(data: CreateCompanyDto): Promise<Company> {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const company = await this.companiesRepo.createCompany({
      ...data,
      password: hashedPassword,
      status: CompanyStatus.PENDING, // 👈 siempre inicia como pendiente
    });

    await this.notificationsService.sendCompanyRequestReceivedEmail({
      email: company.email,
      name: company.name,
      companyName: company.name,
    });

    return company;
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepo.findAll();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepo.findOne(id);
    if (!company) {
      throw new NotFoundException('Compañía no encontrada');
    }
    return company;
  }

  async updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.companiesRepo.updateCompany(id, data);
  }

  // ✅ Método para aprobar/rechazar empresa
  async updateCompanyStatus(
    id: string,
    status: CompanyStatus,
  ): Promise<Company> {
    return this.companiesRepo.updateCompanyStatus(id, status);
  }
}
