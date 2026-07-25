import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RouteRequestType {
  Add = 'add',
  Delete = 'delete',
}

export enum RouteRequestStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

@Entity('route_requests')
export class RouteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RouteRequestType })
  type: RouteRequestType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origin?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  destination?: string;

  @Column('text', { array: true, nullable: true })
  stops?: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  routeId?: string;

  @Column({
    type: 'enum',
    enum: RouteRequestStatus,
    default: RouteRequestStatus.Pending,
  })
  status: RouteRequestStatus;
  // Agregado lo de abajo por la creacion del Dashboard, para poder ver los tickets y requests de cada usuario
  @ManyToOne(() => User, (user) => user.routeRequests, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  requestedBy?: User;
}
