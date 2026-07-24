import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from '../../file-upload/entities/file-uplaod.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  nit: string;

  @Column()
  email: string;

  @OneToMany(() => Document, (document) => document.company)
  documents: Document[];

  @OneToMany(() => Ticket, (ticket) => ticket.company)
  tickets?: Ticket[];
}
