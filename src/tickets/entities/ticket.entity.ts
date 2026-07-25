import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  purchaseDate: Date;

  @ManyToOne(() => User, (user) => user.tickets, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Company, (company) => company.tickets, {
    eager: false,
    onDelete: 'SET NULL',
  })
  company: Company;
}

// prueba para
