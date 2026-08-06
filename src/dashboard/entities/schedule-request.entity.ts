import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Route } from '../../routes/entities/routes.entity';
import { User } from '../../users/entities/user.entity';

export enum ScheduleRequestStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

@Entity('schedule_requests')
export class ScheduleRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'int' })
  routeId: number;

  @ManyToOne(() => Route, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  @Column({ type: 'timestamp with time zone' })
  departureDate: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  totalSeats: number;

  @Column({
    type: 'enum',
    enum: ScheduleRequestStatus,
    default: ScheduleRequestStatus.Pending,
  })
  status: ScheduleRequestStatus;

  @Column({ type: 'uuid', nullable: true })
  createdTripId?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  requestedBy: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
