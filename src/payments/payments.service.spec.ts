import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../common/roles.enum';
import { environment } from '../config/environment';
import { NotificationsService } from '../notifications/notifications.service';
import { TicketsService } from '../tickets/tickets.service';
import { TripsService } from '../trips/trips.service';
import { UsersRepository } from '../users/users.repository';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

describe('PaymentsService authorization', () => {
  const payment = {
    id: 'payment-1',
    userId: 'user-1',
    tripId: 'trip-1',
  } as Payment;
  const paymentsRepository = {
    findOne: jest.fn().mockResolvedValue(payment),
  } as unknown as Repository<Payment>;
  const tripsService = {
    findOne: jest.fn().mockResolvedValue({
      id: 'trip-1',
      companyId: 'company-1',
    }),
  } as unknown as TripsService;
  const usersRepository = {
    getUserById: jest.fn().mockResolvedValue({
      id: 'admin-1',
      companyId: 'company-1',
    }),
  } as unknown as UsersRepository;
  let service: PaymentsService;

  beforeAll(() => {
    environment.STRIPE_SECRET_KEY = 'sk_test_security';
    service = new PaymentsService(
      paymentsRepository,
      tripsService,
      {} as TicketsService,
      {} as NotificationsService,
      usersRepository,
    );
  });

  it('allows a user to read their own payment', async () => {
    await expect(
      service.findOneForRequester('payment-1', {
        id: 'user-1',
        email: 'user@example.com',
        role: Role.User,
      }),
    ).resolves.toBe(payment);
  });

  it('rejects a user reading another user payment', async () => {
    await expect(
      service.findOneForRequester('payment-1', {
        id: 'user-2',
        email: 'other@example.com',
        role: Role.User,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an admin to read payments for their company', async () => {
    await expect(
      service.findOneForRequester('payment-1', {
        id: 'admin-1',
        email: 'admin@example.com',
        role: Role.Admin,
      }),
    ).resolves.toBe(payment);
  });
});
