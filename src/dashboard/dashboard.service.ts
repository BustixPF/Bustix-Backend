import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from '../users/users.repository';
import { CompaniesService } from '../companies/companies.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import {
  RouteRequest,
  RouteRequestStatus,
  RouteRequestType,
} from './entities/route-request.entity';
import {
  CompanyRequest,
  CompanyRequestStatus,
} from './entities/company-request.entity';
import { Role } from '../common/roles.enum';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { RouteRequestDto } from './dto/route-request.dto';
import { RespondCompanyRequestDto } from './dto/respond-company-request.dto';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';
import { SalesQueryDto } from './dto/sales-query.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import { RouteRequestResponseDto } from './dto/route-request-response.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { DashboardUserResponseDto } from './dto/dashboard-user-response.dto';
import { DashboardCompanyResponseDto } from './dto/dashboard-company-response.dto';
import { DashboardCompanyDetailResponseDto } from './dto/dashboard-company-detail-response.dto';
import { DashboardDocumentResponseDto } from './dto/dashboard-document-response.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesService: CompaniesService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(RouteRequest)
    private readonly routeRequestRepo: Repository<RouteRequest>,
    @InjectRepository(CompanyRequest)
    private readonly companyRequestRepo: Repository<CompanyRequest>,
  ) {}

  async getSummary(): Promise<DashboardSummaryResponseDto> {
    // Resumen con conteos básicos para el dashboard
    const [companies, tickets, pendingCompanies, pendingRoutes] =
      await Promise.all([
        this.companiesService.findAll(),
        this.ticketRepo.count(),
        this.companyRequestRepo.count({
          where: { status: CompanyRequestStatus.Pending },
        }),
        this.routeRequestRepo.count({
          where: { status: RouteRequestStatus.Pending },
        }),
      ]);

    return {
      companyCount: companies.length,
      ticketCount: tickets,
      pendingCompanyRequests: pendingCompanies,
      pendingRouteRequests: pendingRoutes,
    };
  }

  async getAllCompanies(): Promise<DashboardCompanyDetailResponseDto[]> {
    // Retorna todas las empresas con documentos asociados
    const companies = await this.companiesService.findAll();
    return companies.map((company) => this.toCompanyDetailResponse(company));
  }

  async getSales(filter?: SalesQueryDto): Promise<SaleResponseDto[]> {
    const queryBuilder = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.company', 'company')
      .orderBy('ticket.purchaseDate', 'DESC');

    if (filter?.userId) {
      queryBuilder.andWhere('user.id = :userId', { userId: filter.userId });
    }

    if (filter?.destination) {
      queryBuilder.andWhere('ticket.destination ILIKE :destination', {
        destination: `%${filter.destination}%`,
      });
    }

    if (filter?.startDate) {
      queryBuilder.andWhere('ticket.purchaseDate >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter?.endDate) {
      queryBuilder.andWhere('ticket.purchaseDate <= :endDate', {
        endDate: filter.endDate,
      });
    }

    const tickets = await queryBuilder.getMany();
    return tickets.map((ticket) => this.toSaleResponse(ticket));
  }

  async getCompanyRequests(): Promise<CompanyRequestResponseDto[]> {
    const requests = await this.companyRequestRepo.find({
      where: { status: CompanyRequestStatus.Pending },
      relations: { requestedBy: true },
    });
    return requests.map((request) => this.toCompanyRequestResponse(request));
  }

  async respondCompanyRequest(
    id: string,
    payload: RespondCompanyRequestDto,
  ): Promise<CompanyRequestResponseDto> {
    const request = await this.companyRequestRepo.findOne({
      where: { id },
      relations: { requestedBy: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud de empresa no encontrada');
    }

    if (request.status !== CompanyRequestStatus.Pending) {
      throw new BadRequestException('La solicitud ya fue procesada');
    }

    request.status = payload.status;
    request.message = payload.message;
    await this.companyRequestRepo.save(request);

    if (payload.status === CompanyRequestStatus.Accepted) {
      await this.companiesService.createCompany({
        name: request.name,
        email: request.email,
        nit: request.nit,

        phone: request.phone,
        password: request.password,
        confirmPassword: request.confirmPassword,
      });

      if (request.requestedBy) {
        await this.usersRepository.updateUser(request.requestedBy.id, {
          role: Role.Admin,
        });
      }
    }

    if (request.requestedBy) {
      await this.notificationsService.sendCompanyRequestDecisionEmail({
        email: request.requestedBy.email,
        name: request.requestedBy.name,
        status: request.status,
        message: request.message,
      });
    }

    return this.toCompanyRequestResponse(request);
  }

  async changeUserRole(
    userId: string,
    role: Role,
  ): Promise<DashboardUserResponseDto> {
    // Cambia el rol de un usuario existente
    const updatedUser = await this.usersRepository.updateUser(userId, { role });
    await this.notificationsService.sendRoleChangedEmail({
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });
    return this.toUserResponse(updatedUser);
  }

  async requestRoute(
    userId: string,
    requestData: RouteRequestDto,
  ): Promise<RouteRequestResponseDto> {
    if (requestData.type === RouteRequestType.Add) {
      if (!requestData.origin || !requestData.destination) {
        throw new BadRequestException(
          'Origen y destino son obligatorios para solicitar agregar ruta',
        );
      }
    }

    if (requestData.type === RouteRequestType.Delete) {
      if (!requestData.routeId) {
        throw new BadRequestException(
          'routeId es obligatorio para solicitar eliminar ruta',
        );
      }
    }

    const user = await this.usersRepository.getUserById(userId);

    const routeRequest = this.routeRequestRepo.create({
      type: requestData.type,
      origin: requestData.origin,
      destination: requestData.destination,
      stops: requestData.stops,
      routeId: requestData.routeId,
      status: RouteRequestStatus.Pending,
      requestedBy: user as User,
    });

    const savedRouteRequest = await this.routeRequestRepo.save(routeRequest);
    return this.toRouteRequestResponse(savedRouteRequest);
  }

  async deleteRouteRequest(
    userId: string,
    routeId: string,
  ): Promise<RouteRequestResponseDto> {
    const user = await this.usersRepository.getUserById(userId);

    const routeRequest = this.routeRequestRepo.create({
      type: RouteRequestType.Delete,
      routeId,
      status: RouteRequestStatus.Pending,
      requestedBy: user as User,
    });

    const savedRouteRequest = await this.routeRequestRepo.save(routeRequest);
    return this.toRouteRequestResponse(savedRouteRequest);
  }

  async getUserTickets(userId: string): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketRepo.find({
      where: { user: { id: userId } },
      relations: { company: true },
      order: { purchaseDate: 'DESC' },
    });
    return tickets.map((ticket) => this.toTicketResponse(ticket));
  }

  async getUserProfile(userId: string): Promise<DashboardUserResponseDto> {
    const user = await this.usersRepository.getUserById(userId);
    return this.toUserResponse(user);
  }

  async updateUserProfile(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<DashboardUserResponseDto> {
    const user = await this.usersRepository.updateUser(userId, payload);
    return this.toUserResponse(user);
  }

  private toUserResponse(
    user: Omit<User, 'password'> | User,
  ): DashboardUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      dni: user.dni ?? 0,
      phone: user.phone ?? 0,
      address: user.address,
      role: user.role,
    };
  }

  private toCompanyResponse(company: {
    id: string;
    name: string;
    nit: string;
    email: string;


    phone: string;
  }): DashboardCompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      nit: company.nit,
      email: company.email,


      phone: company.phone,
    };
  }

  private toDocumentResponse(document: {
    id: string;
    url: string;
    filename: string;
    mimetype: string;
  }): DashboardDocumentResponseDto {
    return {
      id: document.id,
      url: document.url,
      filename: document.filename,
      mimetype: document.mimetype,
    };
  }

  private toCompanyDetailResponse(company: {
    id: string;
    name: string;
    nit: string;
    email: string;
    phone: string;
    documents?: Array<{
      id: string;
      url: string;
      filename: string;
      mimetype: string;
    }>;
  }): DashboardCompanyDetailResponseDto {
    return {
      ...this.toCompanyResponse(company),
      documents: (company.documents ?? []).map((document) =>
        this.toDocumentResponse(document),
      ),
    };
  }

  private toTicketResponse(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.id,
      origin: ticket.origin,
      destination: ticket.destination,
      price: Number(ticket.price),
      purchaseDate: ticket.purchaseDate,
      company: ticket.company ? this.toCompanyResponse(ticket.company) : null,
    };
  }

  private toSaleResponse(ticket: Ticket): SaleResponseDto {
    return {
      id: ticket.id,
      origin: ticket.origin,
      destination: ticket.destination,
      price: Number(ticket.price),
      purchaseDate: ticket.purchaseDate,
      user: ticket.user ? this.toUserResponse(ticket.user) : null,
      company: ticket.company ? this.toCompanyResponse(ticket.company) : null,
    };
  }

  private toCompanyRequestResponse(
    request: CompanyRequest,
  ): CompanyRequestResponseDto {
    return {
      id: request.id,
      name: request.name,
      nit: request.nit,
      email: request.email,
      message: request.message,
      status: request.status,
      requestedBy: request.requestedBy
        ? this.toUserResponse(request.requestedBy)
        : null,
    };
  }

  private toRouteRequestResponse(
    request: RouteRequest,
  ): RouteRequestResponseDto {
    return {
      id: request.id,
      type: request.type,
      origin: request.origin,
      destination: request.destination,
      stops: request.stops,
      routeId: request.routeId,
      status: request.status,
      requestedBy: request.requestedBy
        ? this.toUserResponse(request.requestedBy)
        : null,
    };
  }
}
