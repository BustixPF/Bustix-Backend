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

interface CreateCompanyOptions {
  notifyPending?: boolean;
  status?: CompanyStatus;
}

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companiesRepo: CompaniesRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createCompany(
    data: CreateCompanyDto,
    options: CreateCompanyOptions = {},
  ): Promise<Company> {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const company = await this.companiesRepo.createCompany({
      ...data,
      password: hashedPassword,
      status: options.status ?? CompanyStatus.PENDING,
    });

    if (options.notifyPending !== false) {
      await this.notificationsService.sendCompanyRequestReceivedEmail({
        email: company.email,
        name: company.name,
        companyName: company.name,
      });
    }

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
    rejectionReason?: string,
  ): Promise<Company> {
    const company = await this.companiesRepo.updateCompanyStatus(
      id,
      status,
      rejectionReason,
    );

    await this.notificationsService.sendCompanyRequestDecisionEmail({
      email: company.email,
      name: company.name,
      status,
      message: rejectionReason,
    });

    return company;
  }
}
