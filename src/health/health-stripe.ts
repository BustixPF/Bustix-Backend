import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeHealthIndicator extends HealthIndicator {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    super();
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2023-10-16' as any,
      });
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.stripe) {
        throw new Error('STRIPE_SECRET_KEY no configurada');
      }

      // Consulta liviana a la API de Stripe usando tus credenciales
      await this.stripe.balance.retrieve();

      return this.getStatus(key, true, {
        message: 'Conexión con Stripe activa',
      });
    } catch (error: any) {
      throw new HealthCheckError(
        'Fallo en verificación de Stripe',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
