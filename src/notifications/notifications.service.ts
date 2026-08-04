import { Injectable, Logger } from '@nestjs/common';
import { Role } from '../common/roles.enum';
import { CompanyRequestStatus } from '../dashboard/entities/company-request.entity';
import { RouteRequestType } from '../dashboard/entities/route-request.entity';
import { environment } from '../config/environment';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly mailFrom = environment.MAIL_FROM;

  async sendWelcomeEmail(payload: {
    email: string;
    name: string;
  }): Promise<void> {
    return this.dispatchEmail({
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

    return this.dispatchEmail({
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
    return this.dispatchEmail({
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
    return this.dispatchEmail({
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
    return this.dispatchEmail({
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
    return this.dispatchEmail({
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

    return this.dispatchEmail({
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

  private isMailConfigured(): boolean {
    return Boolean(
      environment.MAILTRAP_API_TOKEN &&
      environment.MAILTRAP_INBOX_ID &&
      environment.MAIL_FROM,
    );
  }

  private dispatchEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.isMailConfigured()) {
      this.logger.warn(
        'MAILTRAP_API_TOKEN/MAILTRAP_INBOX_ID/MAIL_FROM no estan configurados. El email se omitira.',
      );
      return Promise.resolve();
    }

    void this.sendEmail(payload)
      .then(() =>
        this.logger.log(`Email enviado a ${payload.to}: ${payload.subject}`),
      )
      .catch((error: unknown) =>
        this.logger.error(
          `No se pudo enviar el email a ${payload.to}`,
          error instanceof Error ? error.stack : undefined,
        ),
      );

    // Email delivery must never delay the operation that triggered it.
    return Promise.resolve();
  }

  private async sendEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), 10_000);

    try {
      const response = await fetch(
        `https://sandbox.api.mailtrap.io/api/send/${encodeURIComponent(environment.MAILTRAP_INBOX_ID)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${environment.MAILTRAP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.parseMailFrom(),
            to: [{ email: payload.to }],
            subject: payload.subject,
            html: payload.html,
          }),
          signal: timeoutController.signal,
        },
      );

      if (!response.ok) {
        const errorDetails = (await response.text()).trim();
        throw new Error(
          `Mailtrap API respondio con ${response.status} ${response.statusText}${
            errorDetails ? `: ${errorDetails.slice(0, 1_000)}` : ''
          }`,
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseMailFrom(): { email: string; name?: string } {
    const rawMailFrom = this.mailFrom.trim();
    const hasWrappingQuotes =
      rawMailFrom.length >= 2 &&
      ((rawMailFrom.startsWith('"') && rawMailFrom.endsWith('"')) ||
        (rawMailFrom.startsWith("'") && rawMailFrom.endsWith("'")));
    const normalizedMailFrom = hasWrappingQuotes
      ? rawMailFrom.slice(1, -1).trim()
      : rawMailFrom;
    const addressWithName = normalizedMailFrom.match(
      /^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/,
    );

    if (!addressWithName) {
      return { email: normalizedMailFrom };
    }

    const [, name, email] = addressWithName;
    return {
      email: email.trim(),
      ...(name.trim() ? { name: name.trim() } : {}),
    };
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
