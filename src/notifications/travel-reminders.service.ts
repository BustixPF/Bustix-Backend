import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import {
  NotificationDelivery,
  NotificationDeliveryType,
} from './entities/notification-delivery.entity';
import { NotificationsService } from './notifications.service';

interface PurchasedTrip {
  userId: string;
  tripId: string;
  email: string;
  name: string;
  origin: string;
  destination: string;
  departureDate: Date;
  seatNumbers: number[];
}

@Injectable()
export class TravelRemindersService {
  private readonly logger = new Logger(TravelRemindersService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(NotificationDelivery)
    private readonly deliveriesRepository: Repository<NotificationDelivery>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 */15 * * * *', {
    name: 'travel-reminders',
    waitForCompletion: true,
  })
  async sendDueReminders(): Promise<void> {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(
      now.getTime() + 48 * 60 * 60 * 1_000,
    );
    const tickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.user', 'user')
      .innerJoinAndSelect('ticket.trip', 'trip')
      .where('trip.departureDate > :now', { now })
      .andWhere('trip.departureDate <= :until', {
        until: fortyEightHoursFromNow,
      })
      .getMany();

    const purchasedTrips = this.groupTicketsByUserAndTrip(tickets);
    await Promise.all(
      purchasedTrips.map((purchase) => this.sendReminder(purchase, now)),
    );
  }

  private groupTicketsByUserAndTrip(tickets: Ticket[]): PurchasedTrip[] {
    const purchases = new Map<string, PurchasedTrip>();

    for (const ticket of tickets) {
      if (!ticket.user || !ticket.trip) continue;
      const key = `${ticket.user.id}:${ticket.trip.id}`;
      const existing = purchases.get(key);

      if (existing) {
        if (ticket.seatNumber != null) {
          existing.seatNumbers.push(ticket.seatNumber);
        }
        continue;
      }

      purchases.set(key, {
        userId: ticket.user.id,
        tripId: ticket.trip.id,
        email: ticket.user.email,
        name: ticket.user.name,
        origin: ticket.trip.origin,
        destination: ticket.trip.destination,
        departureDate: ticket.trip.departureDate,
        seatNumbers: ticket.seatNumber != null ? [ticket.seatNumber] : [],
      });
    }

    return [...purchases.values()];
  }

  private async sendReminder(
    purchase: PurchasedTrip,
    now: Date,
  ): Promise<void> {
    const hoursUntilDeparture =
      (purchase.departureDate.getTime() - now.getTime()) / (60 * 60 * 1_000);
    const hoursBefore: 24 | 48 = hoursUntilDeparture <= 24 ? 24 : 48;
    const type =
      hoursBefore === 24
        ? NotificationDeliveryType.TripReminder24Hours
        : NotificationDeliveryType.TripReminder48Hours;
    const delivery = await this.claimDelivery(type, purchase);
    if (!delivery) return;

    try {
      await this.notificationsService.sendTravelReminderEmail({
        email: purchase.email,
        name: purchase.name,
        origin: purchase.origin,
        destination: purchase.destination,
        departureDate: purchase.departureDate,
        seatNumbers: [...purchase.seatNumbers].sort((a, b) => a - b),
        hoursBefore,
      });
      delivery.sentAt = new Date();
      await this.deliveriesRepository.save(delivery);
    } catch (error) {
      await this.deliveriesRepository.delete(delivery.id);
      this.logger.error(
        `No se pudo enviar el recordatorio de ${hoursBefore} horas para el viaje ${purchase.tripId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async claimDelivery(
    type: NotificationDeliveryType,
    purchase: PurchasedTrip,
  ): Promise<NotificationDelivery | null> {
    try {
      return await this.deliveriesRepository.save(
        this.deliveriesRepository.create({
          type,
          userId: purchase.userId,
          tripId: purchase.tripId,
        }),
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        return null;
      }
      throw error;
    }
  }
}
