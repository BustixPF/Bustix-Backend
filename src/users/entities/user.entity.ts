import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from '../../common/roles.enum';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { CompanyRequest } from '../../dashboard/entities/company-request.entity';
import { RouteRequest } from '../../dashboard/entities/route-request.entity';

@Entity({ name: 'users' })
export class User {
  /**
   * uuid v4 generado por la base de datos
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nombre completo del usuario
   * @example 'Santiago Burke'
   */
  @Column({ type: 'varchar', length: 80, nullable: false })
  name: string;

  /**
   * Email único, usado para login
   * @example 'example@mail.com'
   */
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  email: string;

  /**
   * Password hasheado (nunca se guarda en texto plano)
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  /**
   * DNI / documento de identidad, único. Necesario para emitir el ticket de bus.
   * @example 40123456
   */
  @Column({ type: 'bigint', nullable: true , unique: true })
  dni?: number;

  /**
   * Teléfono de contacto
   * @example 1123456789
   */
  @Column({ type: 'bigint', nullable: true })
phone?: number;

  /**
   * Dirección, opcional
   * @example 'Calle Falsa 123'
   */
  @Column({ type: 'text', nullable: true })
  address?: string;

  /**
   * Rol del usuario dentro del sistema
   */
  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;
  // Agregado lo de abajo por la creacion del Dashboard, para poder ver los tickets y requests de cada usuario
  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets?: Ticket[];

  @OneToMany(
    () => CompanyRequest,
    (companyRequest) => companyRequest.requestedBy,
  )
  companyRequests?: CompanyRequest[];

  @OneToMany(() => RouteRequest, (routeRequest) => routeRequest.requestedBy)
  routeRequests?: RouteRequest[];
}
