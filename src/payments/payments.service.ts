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

      // Un Ticket por cada asiento comprado
      await Promise.all(
        (seatIds.length > 0 ? seatIds : [null]).map(() =>
          this.ticketsService.create({
            origin: trip?.origin ?? '',
            destination: trip?.destination ?? '',
            price: perSeatPrice,
            userId: payment.userId!,
            companyId: trip?.companyId ?? '',
          }),
        ),
      );

      if (payment.user) {
        await this.notificationsService.sendTicketPurchaseConfirmedEmail({
          email: payment.user.email,
          name: payment.user.name,
          origin: trip?.origin ?? 'Origen no disponible',
          destination: trip?.destination ?? 'Destino no disponible',
          departureDate: trip?.departureDate ?? null,
          seatCount: seatIds.length || 1,
          totalAmount: Number(payment.amount),
          currency: payment.currency,
          paymentId: payment.id,
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

    if (payment.userId) {
      const trip = payment.tripId
        ? await this.tripsService.findOne(payment.tripId)
        : null;

      if (payment.user) {
        await this.notificationsService.sendPaymentCanceledEmail({
          email: payment.user.email,
          name: payment.user.name,
          origin: trip?.origin ?? 'Origen no disponible',
          destination: trip?.destination ?? 'Destino no disponible',
          seatCount: seatIds.length || 1,
          totalAmount: Number(payment.amount),
          currency: payment.currency,
        });
      }
    }
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }
}
