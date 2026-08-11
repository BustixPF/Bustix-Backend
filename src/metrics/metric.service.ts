import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { GetMetricsDto } from './dto/metric-dto';
import { CompanyStatus } from '../common/company-status.enum';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async getGlobalMetrics(dto: GetMetricsDto) {
    const { startDate, endDate } = dto;

    // 1. Total Ingresos y Pagos Completados
    const incomeQuery = this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalIncome')
      .addSelect('COUNT(payment.id)', 'totalPaidTransactions')
      .where('payment.status = :status', { status: PaymentStatus.Paid });

    if (startDate && endDate) {
      incomeQuery.andWhere(
        'payment.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      );
    }

    const incomeResult = await incomeQuery.getRawOne();

    // 2. Conteo de Empresas Activas
    const activeCompanies = await this.companiesRepository.count({
      where: { status: CompanyStatus.APPROVED },
    });

    // 3. Conteo de Usuarios Registrados
    const totalUsers = await this.usersRepository.count();

    // 4. Total de Pasajes / Tickets Vendidos
    const totalTickets = await this.ticketsRepository.count();

    // 5. Ingresos Agrupados por Mes (Para Gráficos)
    const salesOverTime = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select("DATE_TRUNC('month', payment.createdAt)", 'period')
      .addSelect('SUM(payment.amount)', 'total')
      .addSelect('COUNT(payment.id)', 'count')
      .where('payment.status = :status', { status: PaymentStatus.Paid })
      .groupBy("DATE_TRUNC('month', payment.createdAt)")
      .orderBy('period', 'ASC')
      .getRawMany();

    // 6. Top 5 Rutas / Destinos más Vendidos
    const topRoutes = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.origin', 'origin')
      .addSelect('ticket.destination', 'destination')
      .addSelect('COUNT(ticket.id)', 'ticketsSold')
      .groupBy('ticket.origin')
      .addGroupBy('ticket.destination')
      .orderBy('"ticketsSold"', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      overview: {
        totalIncome: Number(incomeResult?.totalIncome || 0),
        totalPaidTransactions: Number(incomeResult?.totalPaidTransactions || 0),
        totalTicketsSold: totalTickets,
        activeCompanies,
        totalUsers,
      },
      charts: {
        salesOverTime: salesOverTime.map((row) => ({
          date: row.period,
          total: Number(row.total),
          count: Number(row.count),
        })),
        topRoutes: topRoutes.map((row) => ({
          route: `${row.origin} - ${row.destination}`,
          ticketsSold: Number(row.ticketsSold),
        })),
      },
    };
  }
}
