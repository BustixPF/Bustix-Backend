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

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {
    if (!environment.STRIPE_SECRET_KEY) {
      throw new Error('Falta configurar STRIPE_SECRET_KEY en el .env');
    }
    this.stripe = new Stripe(environment.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const currency = dto.currency ?? 'usd';

    const payment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        amount: dto.amount,
        currency,
        description: dto.description,
        userId: dto.userId,
        status: PaymentStatus.Pending,
      }),
    );

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: dto.description ?? 'Pasaje Bustix' },
            unit_amount: Math.round(dto.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${environment.FRONTEND_URL}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${environment.FRONTEND_URL}/pago/cancelado`,
      metadata: { paymentId: payment.id },
    });

    payment.stripeSessionId = session.id;
    await this.paymentsRepository.save(payment);

    return { url: session.url, paymentId: payment.id };
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
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this.markPaymentAsPaid(session);
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        await this.updatePaymentStatusBySession(
          session.id,
          PaymentStatus.Canceled,
        );
        break;
      }
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
    if (!payment) return;

    payment.status = PaymentStatus.Paid;
    payment.stripePaymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? payment.stripePaymentIntentId);

    await this.paymentsRepository.save(payment);
  }

  private async updatePaymentStatusBySession(
    sessionId: string,
    status: PaymentStatus,
  ) {
    const payment = await this.paymentsRepository.findOne({
      where: { stripeSessionId: sessionId },
    });
    if (!payment) return;
    payment.status = status;
    await this.paymentsRepository.save(payment);
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }
}
