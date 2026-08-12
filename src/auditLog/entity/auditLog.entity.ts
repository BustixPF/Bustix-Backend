// src/audit/entities/audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  userRole: string;

  @Column()
  action: string; // Ej: "APPROVE_COMPANY", "UPDATE_TRIP"

  @Column()
  method: string; // GET, POST, PATCH, DELETE

  @Column()
  endpoint: string; // /companies/123/status

  @Column({ type: 'jsonb', nullable: true })
  payload: any; // Body o parámetros enviados

  @Column({ type: 'jsonb', nullable: true })
  response: any; // Respuesta devuelta (opcional)

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn()
  createdAt: Date;
}
