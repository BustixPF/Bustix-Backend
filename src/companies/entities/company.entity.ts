import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from '../../file-upload/entities/file-uplaod.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { Route } from '../../routes/entities/routes.entity';
import { CompanyStatus } from '../../common/company-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // NOMBRE DE LA EMPRESA

  @Column({ unique: true })
  nit: string; // NIT

  @Column({ unique: true })
  email: string; // CORREO ELECTRÓNICO CORPORATIVO

  @Column()
  phone: string; // TELÉFONO

  @Column()
  password: string; // CONTRASEÑA (encriptada con bcrypt)

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.PENDING,
  })
  status: CompanyStatus; // ESTADO DE APROBACIÓN

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string | null;

  @OneToMany(() => Document, (document) => document.company)
  documents: Document[];

  @OneToMany(() => Ticket, (ticket) => ticket.company)
  tickets?: Ticket[];

  // Relación con rutas
  @OneToMany(() => Route, (route) => route.company)
  routes: Route[];

  // Relación con viajes
  @OneToMany(() => Trip, (trip) => trip.company)
  trips: Trip[];

  /**
   * Relación con los usuarios que son Admins de esta empresa
   */
  @OneToMany(() => User, (user) => user.company)
  admins: User[];
}
