import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { environment } from '../config/environment';
import { TripsService } from '../trips/trips.service';
import { TicketsService } from '../tickets/tickets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { Role } from '../common/roles.enum';
import { UsersRepository } from '../users/users.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly tripsService: TripsService,
    private readonly ticketsService: TicketsService,
    private readonly notificationsService: NotificationsService,
    private readonly usersRepository: UsersRepository,
  ) {
    if (!environment.STRIPE_SECRET_KEY) {
      throw new Error('Falta configurar STRIPE_SECRET_KEY en el .env');
    }
    this.stripe = new Stripe(environment.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto, userId: string) {
    const trip = await this.tripsService.findOne(dto.tripId);
    const seatIds = [...new Set(dto.seatIds)];

    const reserved: string[] = [];
    try {
      for (const seatId of seatIds) {
        await this.tripsService.reserveSeat(dto.tripId, seatId);
        reserved.push(seatId);
      }
    } catch (err) {
      await Promise.all(
        reserved.map((id) => this.tripsService.releaseSeat(id)),
      );
      throw err;
    }

    const currency = 'cop';
    const quantity = seatIds.length;
    const totalAmount = Number(trip.price) * quantity;
    const description = `${trip.origin} - ${trip.destination} (${quantity} ${quantity === 1 ? 'pasaje' : 'pasajes'})`;

    const payment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        amount: totalAmount,
        currency,
        description,
        userId,
        tripId: trip.id,
        seatIds,
        status: PaymentStatus.Pending,
      }),
    );

    try {
      const baseUrl = (environment.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: description },
              unit_amount: Math.round(Number(trip.price) * 100),
            },
            quantity,
          },
        ],
        success_url: `${baseUrl}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pago/cancelado?payment_id=${payment.id}`,
        metadata: {
          paymentId: payment.id,
          tripId: trip.id,
          seatIds: seatIds.join(','),
          userId,
        },
      });

      payment.stripeSessionId = session.id;
      await this.paymentsRepository.save(payment);
      return { url: session.url, paymentId: payment.id };
    } catch (err) {
      await Promise.all(seatIds.map((id) => this.tripsService.releaseSeat(id)));
      throw err;
    }
  }

  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        environment.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new BadRequestException(
        `Firma de webhook inválida: ${(err as Error).message}`,
      );
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.markPaymentAsPaid(event.data.object);
        break;
      case 'checkout.session.expired':
        await this.cancelPaymentBySessionId(event.data.object.id);
        break;
      default:
        break;
    }
    return { received: true };
  }

  private async markPaymentAsPaid(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.paymentId;
    const payment = paymentId
      ? await this.paymentsRepository.findOne({ where: { id: paymentId } })
      : await this.paymentsRepository.findOne({
          where: { stripeSessionId: session.id },
        });
    if (!payment || payment.status === PaymentStatus.Paid) return;

    payment.status = PaymentStatus.Paid;
    payment.stripePaymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? payment.stripePaymentIntentId);
    await this.paymentsRepository.save(payment);

    const seatIds = payment.seatIds ?? [];
    await Promise.all(
      seatIds.map((id) => this.tripsService.markSeatAsSold(id)),
    );

    if (payment.userId) {
      const trip = payment.tripId
        ? await this.tripsService.findOne(payment.tripId)
        : null;
      const perSeatPrice =
        seatIds.length > 0
          ? Number(payment.amount) / seatIds.length
          : Number(payment.amount);

      const ticketSeatIds: Array<string | null> =
        seatIds.length > 0 ? seatIds : [null];
      const tickets = await Promise.all(
        ticketSeatIds.map(async (seatId) => {
          const seat = seatId
            ? await this.tripsService.findSeatById(seatId)
            : null;
          return this.ticketsService.create({
            origin: trip?.origin ?? '',
            destination: trip?.destination ?? '',
            price: perSeatPrice,
            userId: payment.userId!,
            companyId: trip?.companyId ?? '',
            tripId: trip?.id,
            seatNumber: seat?.seatNumber,
          });
        }),
      );

      if (payment.user && trip) {
        await this.notificationsService.sendTicketPurchaseConfirmedEmail({
          email: payment.user.email,
          name: payment.user.name,
          origin: trip.origin,
          destination: trip.destination,
          departureDate: trip.departureDate,
          seatCount: tickets.length,
          seatNumbers: tickets
            .map((ticket) => ticket.seatNumber)
            .filter((seatNumber): seatNumber is number => seatNumber != null),
          totalAmount: Number(payment.amount),
          currency: payment.currency,
          paymentId: payment.id,
          companyName: trip.company.name,
        });
      }
    }
  }

  async cancelPaymentById(paymentId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    if (
      payment.status === PaymentStatus.Paid ||
      payment.status === PaymentStatus.Canceled
    ) {
      return payment;
    }

    payment.status = PaymentStatus.Canceled;
    await this.paymentsRepository.save(payment);

    const seatIds = payment.seatIds ?? [];
    await Promise.all(seatIds.map((id) => this.tripsService.releaseSeat(id)));

    if (payment.stripeSessionId) {
      try {
        await this.stripe.checkout.sessions.expire(payment.stripeSessionId);
      } catch (e) {
        // Ignorar si la sesión ya había expirado o concluido
      }
    }

    return { message: 'Pago cancelado y asientos liberados', paymentId: payment.id };
  }

  async cancelPaymentBySessionId(sessionId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { stripeSessionId: sessionId },
    });
    if (!payment) return;
    return await this.cancelPaymentById(payment.id);
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  async findOneForRequester(id: string, requester: AuthenticatedUser) {
    const payment = await this.findOne(id);
    await this.assertPaymentAccess(payment, requester);
    return payment;
  }

  async refundPayment(paymentId: string, requester: AuthenticatedUser) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: { user: true },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    await this.assertPaymentAccess(payment, requester, true);

    if (payment.status !== PaymentStatus.Paid) {
      throw new BadRequestException(
        'Solo se pueden reembolsar pagos con estado PAID',
      );
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException(
        'El pago no cuenta con un ID de transacción de Stripe válido',
      );
    }

    try {
      await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar el reembolso en Stripe: ${(error as Error).message}`,
      );
    }

    payment.status = PaymentStatus.Refunded;
    await this.paymentsRepository.save(payment);

    const seatIds = payment.seatIds ?? [];
    if (seatIds.length > 0) {
      await Promise.all(
        seatIds.map((id) => this.tripsService.releaseSeat(id)),
      );
    }

    return {
      message: 'Pago reembolsado correctamente',
      paymentId: payment.id,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredReservations() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredPayments = await this.paymentsRepository.find({
      where: {
        status: PaymentStatus.Pending,
        createdAt: LessThan(tenMinutesAgo),
      },
    });

    for (const payment of expiredPayments) {
      payment.status = PaymentStatus.Canceled;
      await this.paymentsRepository.save(payment);

      if (payment.seatIds && payment.seatIds.length > 0) {
        await Promise.all(
          payment.seatIds.map((seatId) => this.tripsService.releaseSeat(seatId)),
        );
      }
    }
  }

  async getAvailableSeats(tripId: string) {
    const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000);

    const expiredPayments = await this.paymentsRepository.find({
      where: {
        status: PaymentStatus.Pending,
        createdAt: LessThan(TEN_MINUTES_AGO),
      },
    });

    for (const payment of expiredPayments) {
      payment.status = PaymentStatus.Canceled;
      await this.paymentsRepository.save(payment);

      if (payment.seatIds && payment.seatIds.length > 0) {
        await Promise.all(
          payment.seatIds.map((seatId) => this.tripsService.releaseSeat(seatId)),
        );
      }
    }

    return await this.tripsService.findAvailableSeats(tripId);
  }

  private async assertPaymentAccess(
    payment: Payment,
    requester: AuthenticatedUser,
    requireManagement = false,
  ): Promise<void> {
    if (requester.role === Role.superAdmin) return;

    if (!requireManagement && requester.role === Role.User) {
      if (payment.userId === requester.id) return;
      throw new ForbiddenException(
        'No podés consultar un pago de otro usuario',
      );
    }

    if (requester.role === Role.Admin && payment.tripId) {
      const admin = await this.usersRepository.getUserById(requester.id);
      const trip = await this.tripsService.findOne(payment.tripId);
      if (admin.companyId && trip.companyId === admin.companyId) return;
    }

    throw new ForbiddenException('No tenés acceso a este pago');
  }
}