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
import {
  RespondRouteRequestDto,
  RouteRequestDto,
} from './dto/route-request.dto';
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
import { CompanyStatus } from '../common/company-status.enum';
import {
  ScheduleRequest,
  ScheduleRequestStatus,
} from './entities/schedule-request.entity';
import {
  CreateScheduleRequestDto,
  RespondScheduleRequestDto,
} from './dto/schedule-request.dto';
import { ScheduleRequestResponseDto } from './dto/schedule-request-response.dto';
import { RoutesService } from '../routes/routes.service';
import { TripsService } from '../trips/trips.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesService: CompaniesService,
    private readonly notificationsService: NotificationsService,
    private readonly routesService: RoutesService,
    private readonly tripsService: TripsService,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(RouteRequest)
    private readonly routeRequestRepo: Repository<RouteRequest>,
    @InjectRepository(CompanyRequest)
    private readonly companyRequestRepo: Repository<CompanyRequest>,
    @InjectRepository(ScheduleRequest)
    private readonly scheduleRequestRepo: Repository<ScheduleRequest>,
  ) {}

  async getSummary(): Promise<DashboardSummaryResponseDto> {
    // Resumen con conteos básicos para el dashboard
    const [
      companies,
      tickets,
      pendingCompanies,
      pendingRoutes,
      pendingSchedules,
    ] = await Promise.all([
      this.companiesService.findAll(),
      this.ticketRepo.count(),
      this.companyRequestRepo.count({
        where: { status: CompanyRequestStatus.Pending },
      }),
      this.routeRequestRepo.count({
        where: { status: RouteRequestStatus.Pending },
      }),
      this.scheduleRequestRepo.count({
        where: { status: ScheduleRequestStatus.Pending },
      }),
    ]);

    return {
      companyCount: companies.length,
      ticketCount: tickets,
      pendingCompanyRequests: pendingCompanies,
      pendingRouteRequests: pendingRoutes,
      pendingScheduleRequests: pendingSchedules,
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

  async getRouteRequests(): Promise<RouteRequestResponseDto[]> {
    const requests = await this.routeRequestRepo.find({
      where: { status: RouteRequestStatus.Pending },
      relations: { requestedBy: true },
    });
    return requests.map((request) => this.toRouteRequestResponse(request));
  }

  async getScheduleRequests(): Promise<ScheduleRequestResponseDto[]> {
    const requests = await this.scheduleRequestRepo.find({
      where: { status: ScheduleRequestStatus.Pending },
      relations: { requestedBy: true, route: true },
    });
    return requests.map((request) => this.toScheduleRequestResponse(request));
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
      // Crear la empresa y capturar el objeto creado
      const company = await this.companiesService.createCompany(
        {
          name: request.name,
          email: request.email,
          nit: request.nit,
          phone: request.phone,
          password: request.password,
          confirmPassword: request.confirmPassword,
        },
        {
          notifyPending: false,
          status: CompanyStatus.APPROVED,
        },
      );

      if (request.requestedBy) {
        await this.usersRepository.updateUser(request.requestedBy.id, {
          role: Role.Admin,
          companyId: company.id,
        });
      }
    }

    await this.notificationsService.sendCompanyRequestDecisionEmail({
      email: request.requestedBy?.email ?? request.email,
      name: request.requestedBy?.name ?? request.name,
      status: request.status,
      message: request.message,
    });

    return this.toCompanyRequestResponse(request);
  }

  async respondRouteRequest(
    id: string,
    payload: RespondRouteRequestDto,
  ): Promise<RouteRequestResponseDto> {
    const request = await this.routeRequestRepo.findOne({
      where: { id },
      relations: { requestedBy: true },
    });
    if (!request) {
      throw new NotFoundException('Solicitud de ruta no encontrada');
    }
    if (request.status !== RouteRequestStatus.Pending) {
      throw new BadRequestException('La solicitud de ruta ya fue procesada');
    }
    if (payload.status === RouteRequestStatus.Pending) {
      throw new BadRequestException(
        'El nuevo estado debe ser accepted o rejected',
      );
    }

    if (payload.status === RouteRequestStatus.Accepted) {
      if (request.type === RouteRequestType.Add) {
        if (
          !request.origin ||
          !request.destination ||
          !request.duration ||
          !request.price ||
          !request.companyId
        ) {
          throw new BadRequestException(
            'La solicitud no contiene todos los datos para crear la ruta',
          );
        }
        const route = await this.routesService.create({
          origin: request.origin,
          destination: request.destination,
          duration: request.duration,
          price: Number(request.price),
          companyId: request.companyId,
        });
        request.routeId = String(route.id);
      } else if (request.routeId) {
        const routeId = Number(request.routeId);
        if (!Number.isInteger(routeId)) {
          throw new BadRequestException(
            'El identificador de ruta no es valido',
          );
        }
        await this.routesService.delete(routeId);
      }
    }

    request.status = payload.status;
    request.message = payload.message;
    const savedRequest = await this.routeRequestRepo.save(request);

    if (
      savedRequest.status === RouteRequestStatus.Accepted &&
      savedRequest.type === RouteRequestType.Add &&
      savedRequest.requestedBy &&
      savedRequest.origin &&
      savedRequest.destination
    ) {
      await this.notificationsService.sendRouteRequestApprovedEmail({
        email: savedRequest.requestedBy.email,
        name: savedRequest.requestedBy.name,
        origin: savedRequest.origin,
        destination: savedRequest.destination,
      });
    }

    return this.toRouteRequestResponse(savedRequest);
  }

  async respondScheduleRequest(
    id: string,
    payload: RespondScheduleRequestDto,
  ): Promise<ScheduleRequestResponseDto> {
    const request = await this.scheduleRequestRepo.findOne({
      where: { id },
      relations: { requestedBy: true, route: true },
    });
    if (!request) {
      throw new NotFoundException('Solicitud de horario no encontrada');
    }
    if (request.status !== ScheduleRequestStatus.Pending) {
      throw new BadRequestException('La solicitud de horario ya fue procesada');
    }
    if (payload.status === ScheduleRequestStatus.Pending) {
      throw new BadRequestException(
        'El nuevo estado debe ser accepted o rejected',
      );
    }

    if (payload.status === ScheduleRequestStatus.Accepted) {
      const trip = await this.tripsService.create({
        companyId: request.companyId,
        routeId: request.routeId,
        origin: request.route.origin,
        destination: request.route.destination,
        departureDate: request.departureDate.toISOString(),
        price: Number(request.price),
        totalSeats: request.totalSeats,
      });
      request.createdTripId = trip.id;
    }

    request.status = payload.status;
    request.message = payload.message;
    const savedRequest = await this.scheduleRequestRepo.save(request);

    if (
      savedRequest.status === ScheduleRequestStatus.Accepted &&
      savedRequest.requestedBy
    ) {
      await this.notificationsService.sendScheduleRequestApprovedEmail({
        email: savedRequest.requestedBy.email,
        name: savedRequest.requestedBy.name,
        origin: savedRequest.route.origin,
        destination: savedRequest.route.destination,
        departureDate: savedRequest.departureDate,
      });
    }

    return this.toScheduleRequestResponse(savedRequest);
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
      if (
        !requestData.origin ||
        !requestData.destination ||
        !requestData.duration ||
        !requestData.price
      ) {
        throw new BadRequestException(
          'Origen, destino, duracion y precio son obligatorios para solicitar una ruta',
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
    if (!user.companyId) {
      throw new BadRequestException(
        'El administrador no tiene una empresa asociada',
      );
    }

    const routeRequest = this.routeRequestRepo.create({
      type: requestData.type,
      origin: requestData.origin,
      destination: requestData.destination,
      stops: requestData.stops,
      duration: requestData.duration,
      price: requestData.price,
      companyId: user.companyId,
      routeId: requestData.routeId,
      status: RouteRequestStatus.Pending,
      requestedBy: user as User,
    });

    const savedRouteRequest = await this.routeRequestRepo.save(routeRequest);
    await this.notificationsService.sendRouteRequestReceivedEmail({
      email: user.email,
      name: user.name,
      type: savedRouteRequest.type,
      origin: savedRouteRequest.origin,
      destination: savedRouteRequest.destination,
      routeId: savedRouteRequest.routeId,
    });
    return this.toRouteRequestResponse(savedRouteRequest);
  }

  async requestSchedule(
    userId: string,
    payload: CreateScheduleRequestDto,
  ): Promise<ScheduleRequestResponseDto> {
    const user = await this.usersRepository.getUserById(userId);
    if (!user.companyId) {
      throw new BadRequestException(
        'El administrador no tiene una empresa asociada',
      );
    }

    const route = await this.routesService.findById(payload.routeId);
    if (!route) {
      throw new NotFoundException('Ruta no encontrada');
    }
    if (route.companyId !== user.companyId) {
      throw new BadRequestException(
        'La ruta no pertenece a la empresa del administrador',
      );
    }

    const departureDate = new Date(payload.departureDate);
    if (departureDate.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha de salida debe ser futura');
    }

    const request = await this.scheduleRequestRepo.save(
      this.scheduleRequestRepo.create({
        companyId: user.companyId,
        routeId: route.id,
        route,
        departureDate,
        price: payload.price,
        totalSeats: payload.totalSeats,
        status: ScheduleRequestStatus.Pending,
        requestedBy: user as User,
      }),
    );

    await this.notificationsService.sendScheduleRequestReceivedEmail({
      email: user.email,
      name: user.name,
      origin: route.origin,
      destination: route.destination,
      departureDate,
    });

    return this.toScheduleRequestResponse(request);
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
      relations: { company: true, trip: true },
      order: { purchaseDate: 'DESC' },
    });
    return tickets.map((ticket) => this.toTicketResponse(ticket));
  }

  private toTicketResponse(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.id,
      origin: ticket.origin,
      destination: ticket.destination,
      price: Number(ticket.price),
      purchaseDate: ticket.purchaseDate,
      company: ticket.company ? this.toCompanyResponse(ticket.company) : null,
      tripId: ticket.tripId ?? null,
      seatNumber: ticket.seatNumber ?? null,
      departureDate: ticket.trip?.departureDate ?? null,
    };
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
      companyId: user.companyId ?? null,
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
      duration: request.duration,
      price: request.price ? Number(request.price) : undefined,
      companyId: request.companyId,
      routeId: request.routeId,
      status: request.status,
      message: request.message,
      requestedBy: request.requestedBy
        ? this.toUserResponse(request.requestedBy)
        : null,
    };
  }

  private toScheduleRequestResponse(
    request: ScheduleRequest,
  ): ScheduleRequestResponseDto {
    return {
      id: request.id,
      companyId: request.companyId,
      routeId: request.routeId,
      origin: request.route.origin,
      destination: request.route.destination,
      departureDate: request.departureDate,
      price: Number(request.price),
      totalSeats: request.totalSeats,
      status: request.status,
      createdTripId: request.createdTripId,
      message: request.message,
      requestedBy: this.toUserResponse(request.requestedBy),
    };
  }
}
