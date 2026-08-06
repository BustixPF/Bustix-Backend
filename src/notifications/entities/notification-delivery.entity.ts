import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationDeliveryType {
  TripReminder48Hours = 'trip_reminder_48_hours',
  TripReminder24Hours = 'trip_reminder_24_hours',
}

@Entity('notification_deliveries')
@Index(['type', 'userId', 'tripId'], { unique: true })
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationDeliveryType })
  type: NotificationDeliveryType;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  tripId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  claimedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  sentAt?: Date;
}
