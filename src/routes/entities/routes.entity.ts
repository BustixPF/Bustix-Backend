import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { Exclude } from 'class-transformer';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  origin: string;

  @Column({ length: 100 })
  destination: string;

  @Column({ type: 'int' })
  duration: number; // minutos

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.routes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => Trip, (trip) => trip.route)
  @Exclude() // 👈 AGREGAR ESTO PARA EVITAR EL BUCLE RECURSIVO A TRIPS
  trips: Trip[];
}
