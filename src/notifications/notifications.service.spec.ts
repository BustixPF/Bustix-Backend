import { Logger } from '@nestjs/common';
import { environment } from '../config/environment';
import { NotificationsService } from './notifications.service';
import { EmailTemplatesService } from './email-templates.service';
import { CompanyRequestStatus } from '../dashboard/entities/company-request.entity';
import { Role } from '../common/roles.enum';
import { RouteRequestType } from '../dashboard/entities/route-request.entity';

describe('NotificationsService', () => {
  it('does not wait for the email provider before resolving', async () => {
    let completeRequest: (response: Response) => void;
    const fetchMock = jest.spyOn(global, 'fetch').mockReturnValue(
      new Promise((resolve) => {
        completeRequest = resolve;
      }),
    );

    environment.BREVO_API_KEY = 'test-token';
    environment.BREVO_SENDER_EMAIL = 'test@bustix.com';
    environment.BREVO_SENDER_NAME = 'BusTix';

    const service = new NotificationsService(new EmailTemplatesService());

    await expect(
      service.sendWelcomeEmail({
        email: 'user@bustix.com',
        name: 'Usuario',
      }),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(request).toMatchObject({
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': 'test-token',
        'Content-Type': 'application/json',
      },
    });
    const body = JSON.parse(request?.body as string) as {
      sender: { email: string; name: string };
      to: Array<{ email: string }>;
      subject: string;
      htmlContent: string;
      textContent: string;
    };
    expect(body).toMatchObject({
      sender: { email: 'test@bustix.com', name: 'BusTix' },
      to: [{ email: 'user@bustix.com' }],
      subject: 'Bienvenido a BusTix',
    });
    expect(body.htmlContent).toContain('Bienvenido a BusTix');
    expect(body.textContent).toContain('Bienvenido a BusTix');

    completeRequest!({ ok: true } as Response);
    await Promise.resolve();
    fetchMock.mockRestore();
  });

  it('logs the validation details returned by Brevo', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('{"message":"sender not valid"}'),
    } as Response);
    const errorMock = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    environment.BREVO_API_KEY = 'test-token';
    environment.BREVO_SENDER_EMAIL = 'test@bustix.com';

    const service = new NotificationsService(new EmailTemplatesService());
    await service.sendWelcomeEmail({
      email: 'user@bustix.com',
      name: 'Usuario',
    });
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(errorMock).toHaveBeenCalledWith(
      'No se pudo enviar el email a user@bustix.com',
      expect.stringContaining('sender not valid'),
    );

    fetchMock.mockRestore();
    errorMock.mockRestore();
  });

  it('renders all 12 notification templates before sending', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
    } as Response);
    environment.BREVO_API_KEY = 'test-token';
    environment.BREVO_SENDER_EMAIL = 'test@bustix.com';
    environment.FRONTEND_URL = 'https://bustix.example';
    const service = new NotificationsService(new EmailTemplatesService());
    const departureDate = new Date('2026-08-10T13:30:00.000Z');

    await service.sendWelcomeEmail({ email: 'user@example.com', name: 'Ana' });
    await service.sendCompanyRequestReceivedEmail({
      email: 'company@example.com',
      name: 'Empresa',
      companyName: 'Empresa Demo',
    });
    await service.sendCompanyRequestDecisionEmail({
      email: 'company@example.com',
      name: 'Empresa Demo',
      status: CompanyRequestStatus.Accepted,
    });
    await service.sendCompanyRequestDecisionEmail({
      email: 'company@example.com',
      name: 'Empresa Demo',
      status: CompanyRequestStatus.Rejected,
      message: 'Documentacion incompleta',
    });
    await service.sendRoleChangedEmail({
      email: 'user@example.com',
      name: 'Ana',
      previousRole: Role.User,
      role: Role.Admin,
    });
    await service.sendRouteRequestReceivedEmail({
      email: 'company@example.com',
      name: 'Empresa',
      type: RouteRequestType.Add,
      origin: 'Bogota',
      destination: 'Medellin',
      companyName: 'Empresa Demo',
    });
    await service.sendRouteRequestApprovedEmail({
      email: 'company@example.com',
      name: 'Empresa',
      origin: 'Bogota',
      destination: 'Medellin',
    });
    await service.sendScheduleRequestReceivedEmail({
      email: 'company@example.com',
      name: 'Empresa',
      origin: 'Bogota',
      destination: 'Medellin',
      departureDate,
    });
    await service.sendScheduleRequestApprovedEmail({
      email: 'company@example.com',
      name: 'Empresa',
      origin: 'Bogota',
      destination: 'Medellin',
      departureDate,
      totalSeats: 40,
    });
    await service.sendTicketPurchaseConfirmedEmail({
      email: 'user@example.com',
      name: 'Ana',
      origin: 'Bogota',
      destination: 'Medellin',
      departureDate,
      seatCount: 2,
      totalAmount: 170000,
      currency: 'cop',
      paymentId: 'pay-123',
      seatNumbers: [3, 8],
      companyName: 'Empresa Demo',
    });
    await service.sendTravelReminderEmail({
      email: 'user@example.com',
      name: 'Ana',
      origin: 'Bogota',
      destination: 'Medellin',
      departureDate,
      seatNumbers: [3, 8],
      hoursBefore: 48,
    });
    await service.sendTravelReminderEmail({
      email: 'user@example.com',
      name: 'Ana',
      origin: 'Bogota',
      destination: 'Medellin',
      departureDate,
      seatNumbers: [3, 8],
      hoursBefore: 24,
    });

    expect(fetchMock).toHaveBeenCalledTimes(12);
    for (const [, request] of fetchMock.mock.calls) {
      const body = JSON.parse(request?.body as string) as {
        htmlContent: string;
      };
      expect(body.htmlContent).not.toMatch(/\{\{[^}]+\}\}/);
    }

    fetchMock.mockRestore();
  });
});
