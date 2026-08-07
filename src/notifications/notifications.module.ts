import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { NotificationDelivery } from './entities/notification-delivery.entity';
import { TravelRemindersService } from './travel-reminders.service';
import { EmailTemplatesService } from './email-templates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, NotificationDelivery])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    TravelRemindersService,
    EmailTemplatesService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
