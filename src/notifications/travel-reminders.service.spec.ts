import { QueryFailedError, Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Trip } from '../trips/entities/trip.entity';
import { User } from '../users/entities/user.entity';
import {
  NotificationDelivery,
  NotificationDeliveryType,
} from './entities/notification-delivery.entity';
import { NotificationsService } from './notifications.service';
import { TravelRemindersService } from './travel-reminders.service';

describe('TravelRemindersService', () => {
  it('groups seats and sends each reminder only once', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-04T12:00:00.000Z'));

    const user = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Usuario',
    } as User;
    const trip = {
      id: 'trip-1',
      origin: 'Bogota',
      destination: 'Medellin',
      departureDate: new Date('2026-08-06T11:00:00.000Z'),
    } as Trip;
    const tickets = [
      { user, trip, seatNumber: 8 },
      { user, trip, seatNumber: 3 },
    ] as Ticket[];
    const getMany = jest.fn().mockResolvedValue(tickets);
    const queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany,
    };
    const ticketsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<Ticket>;
    const savedTypes = new Set<NotificationDeliveryType>();
    const deliveriesRepository = {
      create: jest.fn(
        (delivery: NotificationDelivery): NotificationDelivery => delivery,
      ),
      save: jest.fn((delivery: NotificationDelivery) => {
        if (!delivery.id) {
          if (savedTypes.has(delivery.type)) {
            const duplicateError = Object.assign(new Error('duplicate key'), {
              code: '23505',
            });
            return Promise.reject(new QueryFailedError('', [], duplicateError));
          }
          savedTypes.add(delivery.type);
          return Promise.resolve({
            ...delivery,
            id: `delivery-${delivery.type}`,
          });
        }
        return Promise.resolve(delivery);
      }),
      delete: jest.fn(),
    } as unknown as Repository<NotificationDelivery>;
    const sendTravelReminderEmail = jest.fn().mockResolvedValue(undefined);
    const notificationsService = {
      sendTravelReminderEmail,
    } as unknown as NotificationsService;
    const service = new TravelRemindersService(
      ticketsRepository,
      deliveriesRepository,
      notificationsService,
    );

    await service.sendDueReminders();
    await service.sendDueReminders();

    expect(sendTravelReminderEmail).toHaveBeenCalledTimes(1);
    expect(sendTravelReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        seatNumbers: [3, 8],
        hoursBefore: 48,
      }),
    );

    jest.useRealTimers();
  });
});
