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

    environment.MAILTRAP_API_TOKEN = 'test-token';
    environment.MAILTRAP_INBOX_ID = '123456';
    environment.MAIL_FROM = '"BusTix <test@bustix.com>"';

    const service = new NotificationsService();

    await expect(
      service.sendWelcomeEmail({
        email: 'user@bustix.com',
        name: 'Usuario',
      }),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('https://sandbox.api.mailtrap.io/api/send/123456');
    expect(request).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
    });
    const body = JSON.parse(request?.body as string) as {
      from: { email: string; name?: string };
      to: Array<{ email: string }>;
      subject: string;
      html: string;
    };
    expect(body).toMatchObject({
      from: { email: 'test@bustix.com', name: 'BusTix' },
      to: [{ email: 'user@bustix.com' }],
      subject: 'Bienvenido a BusTix',
    });
    expect(body.html).toContain('Bienvenido a BusTix');

    completeRequest!({ ok: true } as Response);
    await Promise.resolve();
    fetchMock.mockRestore();
  });
});
