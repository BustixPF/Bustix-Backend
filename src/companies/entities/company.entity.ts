import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from '../../file-upload/entities/file-uplaod.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

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

  @OneToMany(() => Document, (document) => document.company)
  documents: Document[];

  @OneToMany(() => Ticket, (ticket) => ticket.company)
  tickets?: Ticket[];
}
