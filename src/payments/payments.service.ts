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

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly tripsService: TripsService,
    private readonly ticketsService: TicketsService,
  ) {
    if (!environment.STRIPE_SECRET_KEY) {
      throw new Error('Falta configurar STRIPE_SECRET_KEY en el .env');
    }
    this.stripe = new Stripe(environment.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto, userId: string) {
    const trip = await this.tripsService.findOne(dto.tripId);
    await this.tripsService.reserveSeat(dto.tripId, dto.seatId);

    const currency = 'cop';
    const description = `${trip.origin} - ${trip.destination}`;

    const payment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        amount: trip.price,
        currency,
        description,
        userId,
        tripId: trip.id,
        seatId: dto.seatId,
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
            quantity: 1,
          },
        ],
        success_url: `${environment.FRONTEND_URL}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${environment.FRONTEND_URL}/pago/cancelado`,
        metadata: {
          paymentId: payment.id,
          tripId: trip.id,
          seatId: dto.seatId,
          userId,
        },
      });

      payment.stripeSessionId = session.id;
      await this.paymentsRepository.save(payment);
      return { url: session.url, paymentId: payment.id };
    } catch (err) {
      await this.tripsService.releaseSeat(dto.seatId);
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

    if (payment.seatId) {
      await this.tripsService.markSeatAsSold(payment.seatId);
    }

    if (payment.userId) {
      const trip = payment.tripId
        ? await this.tripsService.findOne(payment.tripId)
        : null;
      await this.ticketsService.create({
        origin: trip?.origin ?? '',
        destination: trip?.destination ?? '',
        price: Number(payment.amount),
        userId: payment.userId,
        companyId: trip?.companyId ?? '',
      });
    }
  }

  private async cancelPayment(sessionId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { stripeSessionId: sessionId },
    });
    if (!payment) return;
    payment.status = PaymentStatus.Canceled;
    await this.paymentsRepository.save(payment);
    if (payment.seatId) {
      await this.tripsService.releaseSeat(payment.seatId);
    }
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }
}
