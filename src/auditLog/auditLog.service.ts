import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entity/auditLog.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async findAll() {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: 100, // Limite de los ultimos 100 registros
    });
  }
}
