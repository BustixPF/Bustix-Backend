import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Role } from '../common/roles.enum';
import { CompanyRequestStatus } from '../dashboard/entities/company-request.entity';
import { RouteRequestType } from '../dashboard/entities/route-request.entity';
import { environment } from '../config/environment';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly mailFrom = environment.MAIL_FROM;
  private readonly transporter = this.createTransporter();

  async sendWelcomeEmail(payload: {
    email: string;
    name: string;
  }): Promise<void> {
    await this.sendEmail({
      to: payload.email,
      subject: 'Bienvenido a BusTix',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Bienvenido a BusTix. Gracias por registrarte en nuestra pagina.</p>
      `,
    });
  }

  async sendCompanyRequestDecisionEmail(payload: {
    email: string;
    name: string;
    status: CompanyRequestStatus;
    message?: string;
  }): Promise<void> {
    const statusLabel =
      payload.status === CompanyRequestStatus.Accepted
        ? 'aprobada'
        : 'rechazada';

    await this.sendEmail({
      to: payload.email,
      subject: `Tu solicitud de empresa fue ${statusLabel}`,
      html: `<h2>Hola, ${payload.name}</h2>
        <p>Tu solicitud de empresa fue <strong>${statusLabel}</strong>.</p>
        ${payload.message ? `<p>Mensaje del equipo: ${payload.message}</p>` : ''}`,
    });
  }

  async sendRoleChangedEmail(payload: {
    email: string;
    name: string;
    role: Role;
  }): Promise<void> {
    await this.sendEmail({
      to: payload.email,
      subject: 'Tu rol en BusTix fue actualizado',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Tu rol en la plataforma ahora es: <strong>${payload.role}</strong>.</p>
      `,
    });
  }

  async sendTicketPurchaseConfirmedEmail(payload: {
    email: string;
    name: string;
    origin: string;
    destination: string;
    departureDate?: Date | null;
    seatCount: number;
    totalAmount: number;
    currency: string;
    paymentId: string;
  }): Promise<void> {
    await this.sendEmail({
      to: payload.email,
      subject: 'Tu compra de pasajes fue confirmada',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Tu compra fue confirmada correctamente.</p>
        <p><strong>Ruta:</strong> ${payload.origin} - ${payload.destination}</p>
        <p><strong>Salida:</strong> ${this.formatDate(payload.departureDate)}</p>
        <p><strong>Cantidad de pasajes:</strong> ${payload.seatCount}</p>
        <p><strong>Total pagado:</strong> ${this.formatCurrency(payload.totalAmount, payload.currency)}</p>
        <p><strong>Referencia de pago:</strong> ${payload.paymentId}</p>
      `,
    });
  }

  async sendPaymentCanceledEmail(payload: {
    email: string;
    name: string;
    origin: string;
    destination: string;
    seatCount: number;
    totalAmount: number;
    currency: string;
  }): Promise<void> {
    await this.sendEmail({
      to: payload.email,
      subject: 'Tu pago no fue completado',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Tu proceso de pago fue cancelado o expiró antes de completarse.</p>
        <p><strong>Ruta:</strong> ${payload.origin} - ${payload.destination}</p>
        <p><strong>Cantidad de pasajes:</strong> ${payload.seatCount}</p>
        <p><strong>Total pendiente:</strong> ${this.formatCurrency(payload.totalAmount, payload.currency)}</p>
        <p>Si quieres, puedes intentarlo nuevamente desde la plataforma.</p>
      `,
    });
  }

  async sendCompanyRequestReceivedEmail(payload: {
    email: string;
    name: string;
    companyName: string;
  }): Promise<void> {
    await this.sendEmail({
      to: payload.email,
      subject: 'Recibimos tu solicitud de empresa',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Recibimos la solicitud para registrar la empresa <strong>${payload.companyName}</strong>.</p>
        <p>La solicitud quedó en estado pendiente y será revisada por el equipo.</p>
      `,
    });
  }

  async sendRouteRequestReceivedEmail(payload: {
    email: string;
    name: string;
    type: RouteRequestType;
    origin?: string;
    destination?: string;
    routeId?: string;
  }): Promise<void> {
    const actionLabel =
      payload.type === RouteRequestType.Add ? 'alta de ruta' : 'baja de ruta';

    await this.sendEmail({
      to: payload.email,
      subject: 'Recibimos tu solicitud de ruta',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Recibimos tu solicitud de <strong>${actionLabel}</strong>.</p>
        ${
          payload.origin && payload.destination
            ? `<p><strong>Trayecto:</strong> ${payload.origin} - ${payload.destination}</p>`
            : ''
        }
        ${payload.routeId ? `<p><strong>Ruta solicitada:</strong> ${payload.routeId}</p>` : ''}
        <p>La solicitud será revisada por el equipo y te notificaremos si hay novedades.</p>
      `,
    });
  }

  private createTransporter(): nodemailer.Transporter | null {
    if (!this.isMailConfigured()) {
      this.logger.warn(
        'MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASSWORD/MAIL_FROM no estan configurados. Los emails se omitiran.',
      );
      return null;
    }

    return nodemailer.createTransport({
      host: environment.MAIL_HOST,
      port: environment.MAIL_PORT,
      secure: environment.MAIL_SECURE,
      auth: {
        user: environment.MAIL_USER,
        pass: environment.MAIL_PASSWORD,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });
  }

  private isMailConfigured(): boolean {
    return Boolean(
      environment.MAIL_HOST &&
        environment.MAIL_PORT &&
        environment.MAIL_USER &&
        environment.MAIL_PASSWORD &&
        environment.MAIL_FROM,
    );
  }

  private async sendEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.transporter) {
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.mailFrom,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      this.logger.log(`Email enviado a ${payload.to}: ${payload.subject}`);
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el email a ${payload.to}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private formatDate(date?: Date | null): string {
    if (!date) {
      return 'Por confirmar';
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
