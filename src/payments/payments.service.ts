import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { environment } from '../config/environment';
import { TripsService } from '../trips/trips.service';
import { TicketsService } from '../tickets/tickets.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly tripsService: TripsService,
    private readonly ticketsService: TicketsService,
    private readonly notificationsService: NotificationsService,
  ) {
    if (!environment.STRIPE_SECRET_KEY) {
      throw new Error('Falta configurar STRIPE_SECRET_KEY en el .env');
    }
    this.stripe = new Stripe(environment.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto, userId: string) {
    const trip = await this.tripsService.findOne(dto.tripId);
    const seatIds = [...new Set(dto.seatIds)];

    // Reserva todos los asientos pedidos. Si alguno falla (ya vendido/reservado),
    // liberamos los que sí se habían reservado y cortamos ahí.
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
        success_url: `${environment.FRONTEND_URL}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${environment.FRONTEND_URL}/pago/cancelado`,
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
        await this.cancelPayment(event.data.object.id);
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

  private async cancelPayment(sessionId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { stripeSessionId: sessionId },
    });
    if (!payment) return;
    payment.status = PaymentStatus.Canceled;
    await this.paymentsRepository.save(payment);
    const seatIds = payment.seatIds ?? [];
    await Promise.all(seatIds.map((id) => this.tripsService.releaseSeat(id)));
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  async refundPayment(paymentId: string) {
  const payment = await this.paymentsRepository.findOne({
    where: { id: paymentId },
    relations: { user: true },
  });

  if (!payment) {
    throw new NotFoundException('Pago no encontrado');
  }

  if (payment.status !== PaymentStatus.Paid) {
    throw new BadRequestException('Solo se pueden reembolsar pagos con estado PAID');
  }

  if (!payment.stripePaymentIntentId) {
    throw new BadRequestException('El pago no cuenta con un ID de transacción de Stripe válido');
  }

  // 1. Solicitar el reembolso a Stripe
  try {
    await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });
  } catch (error) {
    throw new BadRequestException(`Error al procesar el reembolso en Stripe: ${(error as Error).message}`);
  }

  // 2. Actualizar el estado del pago en BD
  payment.status = PaymentStatus.Refunded;
  await this.paymentsRepository.save(payment);

  // 3. Liberar los asientos ocupados
  const seatIds = payment.seatIds ?? [];
  if (seatIds.length > 0) {
    await Promise.all(seatIds.map((id) => this.tripsService.releaseSeat(id)));
  }

  // 4. (Opcional) Notificar al usuario vía correo
  if (payment.user?.email) {
    const trip = payment.tripId ? await this.tripsService.findOne(payment.tripId) : null;
    await this.notificationsService.sendPaymentCanceledEmail({
      email: payment.user.email,
      name: payment.user.name ?? 'Usuario',
      origin: trip?.origin ?? 'N/A',
      destination: trip?.destination ?? 'N/A',
      seatCount: seatIds.length,
      totalAmount: Number(payment.amount),
      currency: payment.currency,
    }).catch(() => null);
  }

  return { message: 'Pago reembolsado correctamente', paymentId: payment.id };
}
}
