import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Seat } from './seat.entity';
import { Route } from '../../routes/entities/routes.entity';
import { TripStatus } from '../../common/trip-status.enum';

@Entity({ name: 'trips' })
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  /**
   * Ciudad de origen
   * @example 'Bogotá'
   */
  @Column({ type: 'varchar', length: 100 })
  origin: string;

  /**
   * Ciudad de destino
   * @example 'Medellín'
   */
  @Column({ type: 'varchar', length: 100 })
  destination: string;

  /**
   * Fecha y hora de salida
   * @example '2026-08-15T09:30:00.000Z'
   */
  @Column({ type: 'timestamp with time zone' })
  departureDate: Date;

  /**
   * Precio oficial del pasaje. El backend SIEMPRE calcula el cobro desde acá, nunca desde el cliente
   * @example 85000
   */
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  totalSeats: number;

  @OneToMany(() => Seat, (seat) => seat.trip, { cascade: true })
  seats: Seat[];

  // Relación con Route
  @ManyToOne(() => Route, (route) => route.trips, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  /**
   * Estado actual del viaje
   * @example 'A_TIEMPO'
   */
  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.ON_TIME,
  })
  status: TripStatus;
}
