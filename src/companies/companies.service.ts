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
import { Role } from '../common/roles.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

interface CreateCompanyOptions {
  notifyPending?: boolean;
  status?: CompanyStatus;
}

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companiesRepo: CompaniesRepository,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async findPublicCompanies(): Promise<Company[]> {
    return this.companiesRepo.findApproved();
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

  // ✅ Método para cambiar estado con validación, limpieza de datos y notificaciones
  async updateCompanyStatus(
    id: string,
    status: CompanyStatus,
    rejectionReason?: string,
  ): Promise<Company> {
    // 1. Validar que el estado enviado sea únicamente APPROVED o REJECTED
    if (
      status !== CompanyStatus.APPROVED &&
      status !== CompanyStatus.REJECTED
    ) {
      throw new BadRequestException('El estado debe ser APPROVED o REJECTED');
    }

    // 2. Validar que la empresa exista antes de operar
    await this.findOne(id);

    // 3. Si se rechaza, es obligatorio enviar un motivo explicativo
    if (status === CompanyStatus.REJECTED) {
      if (!rejectionReason || rejectionReason.trim() === '') {
        throw new BadRequestException(
          'Es obligatorio proporcionar un motivo de rechazo (rejectionReason) cuando el estado es REJECTED.',
        );
      }
    }

    // 4. Normalizar la variable: si no es REJECTED, queda como undefined
    const finalReason =
      status === CompanyStatus.REJECTED ? rejectionReason : undefined;

    // 5. Actualizar en el repositorio (pasa undefined o el string del motivo)
    const company = await this.companiesRepo.updateCompanyStatus(
      id,
      status,
      finalReason,
    );

    // 6. Notificar únicamente en decisiones definitivas (APPROVED o REJECTED)
    if (
      status === CompanyStatus.APPROVED ||
      status === CompanyStatus.REJECTED
    ) {
      await this.notificationsService.sendCompanyRequestDecisionEmail({
        email: company.email,
        name: company.name,
        status,
        message: finalReason,
        companyId: company.id,
      });
    }

    return company;
  }

  async updateCompanyActiveState(
    id: string,
    isActive: boolean,
  ): Promise<Company> {
    const company = await this.findOne(id);
    const updatedCompany = await this.companiesRepo.updateIsActive(
      company,
      isActive,
    );

    // Si la empresa se desactiva, desactivamos también a sus admins asociados
    if (!isActive) {
      await this.usersRepository.update(
        { company: { id } },
        { isActive: false },
      );
    }

    return updatedCompany;
  }

  async assignAdmin(companyId: string, userId: string) {
    // 1. Validar que la empresa exista
    const company = await this.findOne(companyId);

    // 2. Buscar al usuario
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    // 3. Reasignar empresa y actualizar rol si aplica
    user.company = company;
    user.role = Role.Admin; // Aseguramos que tenga el rol correspondiente

    await this.usersRepository.save(user);

    return {
      message: `El usuario ${user.email} fue asignado exitosamente a la empresa ${company.name}.`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: company.id,
      },
    };
  }

  // ✅ Obtener todas las empresas con estado PENDING
  async findPendingCompanies(): Promise<Company[]> {
    return this.companiesRepo.findPendingCompanies();
  }
}
