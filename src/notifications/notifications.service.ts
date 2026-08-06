import { Injectable, Logger } from '@nestjs/common';
import { Role } from '../common/roles.enum';
import { CompanyRequestStatus } from '../dashboard/entities/company-request.entity';
import { RouteRequestType } from '../dashboard/entities/route-request.entity';
import { environment } from '../config/environment';
import { CompanyStatus } from '../common/company-status.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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
    status: CompanyRequestStatus | CompanyStatus;
    message?: string;
  }): Promise<void> {
    const isAccepted =
      payload.status === CompanyRequestStatus.Accepted ||
      payload.status === CompanyStatus.APPROVED;
    const statusLabel = isAccepted ? 'aprobada' : 'rechazada';

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
    seatNumbers?: number[];
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
        ${
          payload.seatNumbers?.length
            ? `<p><strong>Asientos:</strong> ${payload.seatNumbers.join(', ')}</p>`
            : ''
        }
        <p><strong>Total pagado:</strong> ${this.formatCurrency(payload.totalAmount, payload.currency)}</p>
        <p><strong>Referencia de pago:</strong> ${payload.paymentId}</p>
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

  async sendRouteRequestApprovedEmail(payload: {
    email: string;
    name: string;
    origin: string;
    destination: string;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Tu nueva ruta fue aprobada',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>La nueva ruta solicitada fue <strong>aprobada</strong>.</p>
        <p><strong>Trayecto:</strong> ${payload.origin} - ${payload.destination}</p>
        <p>Ya puedes solicitar horarios para esta ruta.</p>
      `,
    });
  }

  async sendScheduleRequestReceivedEmail(payload: {
    email: string;
    name: string;
    origin: string;
    destination: string;
    departureDate: Date;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Recibimos tu solicitud de horario',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Recibimos tu solicitud de un nuevo horario y quedó <strong>pendiente</strong>.</p>
        <p><strong>Trayecto:</strong> ${payload.origin} - ${payload.destination}</p>
        <p><strong>Salida:</strong> ${this.formatDate(payload.departureDate)}</p>
      `,
    });
  }

  async sendScheduleRequestApprovedEmail(payload: {
    email: string;
    name: string;
    origin: string;
    destination: string;
    departureDate: Date;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Tu nuevo horario fue aprobado',
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>El nuevo horario solicitado fue <strong>aprobado</strong>.</p>
        <p><strong>Trayecto:</strong> ${payload.origin} - ${payload.destination}</p>
        <p><strong>Salida:</strong> ${this.formatDate(payload.departureDate)}</p>
        <p>El viaje ya está disponible para la compra de pasajes.</p>
      `,
    });
  }

  async sendTravelReminderEmail(payload: {
    email: string;
    name: string;
    origin: string;
    destination: string;
    departureDate: Date;
    seatNumbers: number[];
    hoursBefore: 24 | 48;
  }): Promise<void> {
    if (!this.isMailConfigured()) {
      throw new Error(
        'BREVO_API_KEY/BREVO_SENDER_EMAIL no estan configurados.',
      );
    }
    await this.deliverEmail({
      to: payload.email,
      subject: `Recordatorio: tu viaje sale en menos de ${payload.hoursBefore} horas`,
      html: `
        <h2>Hola, ${payload.name}</h2>
        <p>Te recordamos que tu viaje está próximo a salir.</p>
        <p><strong>Ruta:</strong> ${payload.origin} - ${payload.destination}</p>
        <p><strong>Salida:</strong> ${this.formatDate(payload.departureDate)}</p>
        ${
          payload.seatNumbers.length
            ? `<p><strong>Asientos:</strong> ${payload.seatNumbers.join(', ')}</p>`
            : ''
        }
      `,
    });
  }

  private isMailConfigured(): boolean {
    return Boolean(environment.BREVO_API_KEY && environment.BREVO_SENDER_EMAIL);
  }

  private dispatchEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    void this.deliverEmail(payload).catch((error: unknown) =>
      this.logger.error(
        `No se pudo enviar el email a ${payload.to}`,
        error instanceof Error ? error.stack : undefined,
      ),
    );

    // Email delivery must never delay the operation that triggered it.
    return Promise.resolve();
  }

  private async deliverEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.isMailConfigured()) {
      this.logger.warn(
        'BREVO_API_KEY/BREVO_SENDER_EMAIL no estan configurados. El email se omitira.',
      );
      return;
    }

    await this.sendEmail(payload);
    this.logger.log(`Email enviado a ${payload.to}: ${payload.subject}`);
  }

  private async sendEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), 10_000);

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': environment.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            email: environment.BREVO_SENDER_EMAIL,
            name: environment.BREVO_SENDER_NAME,
          },
          to: [{ email: payload.to }],
          subject: payload.subject,
          htmlContent: payload.html,
          textContent: this.htmlToText(payload.html),
        }),
        signal: timeoutController.signal,
      });

      if (!response.ok) {
        const errorDetails = (await response.text()).trim();
        throw new Error(
          `Brevo API respondio con ${response.status} ${response.statusText}${
            errorDetails ? `: ${errorDetails.slice(0, 1_000)}` : ''
          }`,
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n\s*\n/g, '\n')
      .trim();
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
