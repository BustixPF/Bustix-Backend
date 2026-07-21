import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from '../../file-upload/entities/file-uplaod.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  nit: string;

  @Column()
  contactEmail: string;

  @OneToMany(() => Document, (document) => document.company)
  documents: Document[];
}
