import { Injectable, Logger } from '@nestjs/common';
import { Role } from '../common/roles.enum';
import { CompanyRequestStatus } from '../dashboard/entities/company-request.entity';
import { RouteRequestType } from '../dashboard/entities/route-request.entity';
import { environment } from '../config/environment';
import { CompanyStatus } from '../common/company-status.enum';
import { EmailTemplatesService } from './email-templates.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly templatesService: EmailTemplatesService) {}

  async sendWelcomeEmail(payload: {
    email: string;
    name: string;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Bienvenido a BusTix',
      html: this.templatesService.render('01-registro-usuario.html', {
        nombre: payload.name,
        url_buscar: this.frontendUrl,
      }),
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
      html: this.templatesService.render(
        isAccepted ? '03-empresa-aprobada.html' : '04-empresa-rechazada.html',
        isAccepted
          ? {
              empresa: payload.name,
              url_panel: this.frontendUrl,
            }
          : {
              empresa: payload.name,
              motivo_rechazo: payload.message ?? 'No se especifico un motivo.',
            },
      ),
    });
  }

  async sendRoleChangedEmail(payload: {
    email: string;
    name: string;
    role: Role;
    previousRole?: Role;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Tu rol en BusTix fue actualizado',
      html: this.templatesService.render('05-cambio-rol.html', {
        rol_anterior: payload.previousRole ?? 'No disponible',
        nuevo_rol: payload.role,
        fecha_cambio: this.formatDateOnly(new Date()),
        url_cuenta: this.frontendUrl,
      }),
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
    companyName?: string;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Tu compra de pasajes fue confirmada',
      html: this.templatesService.render('10-compra-exitosa.html', {
        origen: payload.origin,
        destino: payload.destination,
        empresa: payload.companyName ?? 'BusTix',
        asiento: this.formatSeats(payload.seatNumbers),
        hora: this.formatTime(payload.departureDate),
        fecha: this.formatDateOnly(payload.departureDate),
        codigo_reserva: payload.paymentId,
        url_tiquete: this.frontendUrl,
      }),
    });
  }

  async sendCompanyRequestReceivedEmail(payload: {
    email: string;
    name: string;
    companyName: string;
    routeCount?: number;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Recibimos tu solicitud de empresa',
      html: this.templatesService.render('02-solicitud-empresa.html', {
        empresa: payload.companyName,
        fecha_solicitud: this.formatDateOnly(new Date()),
        numero_rutas: payload.routeCount ?? 0,
      }),
    });
  }

  async sendRouteRequestReceivedEmail(payload: {
    email: string;
    name: string;
    type: RouteRequestType;
    origin?: string;
    destination?: string;
    routeId?: string;
    companyName?: string;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Recibimos tu solicitud de ruta',
      html: this.templatesService.render('06-solicitud-ruta.html', {
        origen: payload.origin ?? 'Por confirmar',
        destino: payload.destination ?? 'Por confirmar',
        empresa: payload.companyName ?? 'BusTix',
        fecha_solicitud: this.formatDateOnly(new Date()),
      }),
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
      html: this.templatesService.render('07-ruta-aprobada.html', {
        origen: payload.origin,
        destino: payload.destination,
        fecha_aprobacion: this.formatDateOnly(new Date()),
        url_horarios: this.frontendUrl,
      }),
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
      html: this.templatesService.render('08-solicitud-horario.html', {
        origen: payload.origin,
        destino: payload.destination,
        hora: this.formatTime(payload.departureDate),
        fecha_solicitud: this.formatDateOnly(new Date()),
      }),
    });
  }

  async sendScheduleRequestApprovedEmail(payload: {
    email: string;
    name: string;
    origin: string;
    destination: string;
    departureDate: Date;
    totalSeats: number;
  }): Promise<void> {
    return this.dispatchEmail({
      to: payload.email,
      subject: 'Tu nuevo horario fue aprobado',
      html: this.templatesService.render('09-horario-aprobado.html', {
        origen: payload.origin,
        destino: payload.destination,
        hora: this.formatTime(payload.departureDate),
        cupos: payload.totalSeats,
        url_panel: this.frontendUrl,
      }),
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
      html: this.templatesService.render(
        payload.hoursBefore === 48
          ? '11-recordatorio-48h.html'
          : '12-recordatorio-24h.html',
        {
          origen: payload.origin,
          destino: payload.destination,
          fecha: this.formatDateOnly(payload.departureDate),
          hora: this.formatTime(payload.departureDate),
          asiento: this.formatSeats(payload.seatNumbers),
          url_tiquete: this.frontendUrl,
        },
      ),
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

  private get frontendUrl(): string {
    return environment.FRONTEND_URL.replace(/\/$/, '');
  }

  private formatDateOnly(date?: Date | null): string {
    if (!date) {
      return 'Por confirmar';
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  private formatTime(date?: Date | null): string {
    if (!date) {
      return 'Por confirmar';
    }

    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota',
    }).format(date);
  }

  private formatSeats(seatNumbers?: number[]): string {
    return seatNumbers?.length ? seatNumbers.join(', ') : 'Por confirmar';
  }
}
