import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { Trip } from '../../trips/entities/trip.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  origin: string;

  @Column({ type: 'varchar', length: 100 })
  destination: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'uuid', nullable: true })
  tripId?: string;

  @ManyToOne(() => Trip, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tripId' })
  trip?: Trip;

  @Column({ type: 'int', nullable: true })
  seatNumber?: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  purchaseDate: Date;

  @ManyToOne(() => User, (user: User) => user.tickets, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Company, (company: Company) => company.tickets, {
    eager: false,
    onDelete: 'SET NULL',
  })
  company: Company;
}
