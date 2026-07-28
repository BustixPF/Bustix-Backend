import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Role } from '../common/roles.enum';
import { CompanyRequestStatus } from '../dashboard/entities/company-request.entity';
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
        <p>Tu cuenta en BusTix fue creada correctamente.</p>
        <p>Ya puedes iniciar sesion y usar la plataforma.</p>
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
}
