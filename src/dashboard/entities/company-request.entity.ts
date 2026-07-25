import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CompanyRequestStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

@Entity('company_requests')
export class CompanyRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nit: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({
    type: 'enum',
    enum: CompanyRequestStatus,
    default: CompanyRequestStatus.Pending,
  })
  status: CompanyRequestStatus;
  // Agregado lo de abajo por la creacion del Dashboard, para poder ver los tickets y requests de cada usuario
  @ManyToOne(() => User, (user) => user.companyRequests, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  requestedBy?: User;
}
