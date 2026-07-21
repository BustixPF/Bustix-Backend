import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @ManyToOne(() => Company, (company) => company.documents, {
    onDelete: 'CASCADE',
  })
  company: Company;
}
