import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../../common/roles.enum';


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
  @Column({ type: 'varchar', length: 60, nullable: false })
  password: string;

  /**
   * DNI / documento de identidad, único. Necesario para emitir el ticket de bus.
   * @example 40123456
   */
  @Column({ type: 'int', unique: true, nullable: false })
  dni: number;

  /**
   * Teléfono de contacto
   * @example 1123456789
   */
  @Column({ type: 'int', nullable: false })
  phone: number;

  /**
   * Dirección, opcional
   * @example 'Calle Falsa 123'
   */
  @Column({ type: 'text', nullable: true })
  address?: string;

  /**
   * Rol del usuario dentro del sistema
   */
  @Column({ type: 'enum', enum: Role, default: User })
  role: Role;
}

