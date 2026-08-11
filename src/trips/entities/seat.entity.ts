import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Trip } from './trip.entity';
import { Exclude } from 'class-transformer';

export enum SeatStatus {
  Available = 'available',
  Reserved = 'reserved',
  Sold = 'sold',
}

@Entity({ name: 'seats' })
@Unique(['tripId', 'seatNumber'])
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tripId: string;

  @ManyToOne(() => Trip, (trip) => trip.seats, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tripId' })
  @Exclude() // 👈 AGREGAR ESTO PARA EVITAR EL BUCLE RECURSIVO A TRIP
  trip: Trip;

  /**
   * Número de asiento dentro del viaje
   * @example 14
   */
  @Column({ type: 'int' })
  seatNumber: number;

  @Column({ type: 'enum', enum: SeatStatus, default: SeatStatus.Available })
  status: SeatStatus;
}
