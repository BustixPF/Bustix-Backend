import { Logger } from '@nestjs/common';
import { environment } from '../config/environment';
import { NotificationsService } from './notifications.service';

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

    const service = new NotificationsService();

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

    const service = new NotificationsService();
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
});
