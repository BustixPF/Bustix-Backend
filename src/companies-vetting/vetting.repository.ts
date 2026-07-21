import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VettingEntity } from './entities/vetting.entity';

@Injectable()
export class VettingRepository {
  constructor(
    @InjectRepository(VettingEntity)
    private readonly repo: Repository<VettingEntity>,
  ) {}

  async createRecord(companyId: string, fileUrl: string) {
    const record = this.repo.create({
      companyId,
      fileUrl,
      status: 'pending_review',
    });
    return this.repo.save(record);
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    notes?: string,
  ) {
    await this.repo.update(id, { status, reviewerNotes: notes });
    return this.repo.findOne({ where: { id } });
  }

  async findByCompany(companyId: string) {
    return this.repo.find({ where: { companyId } });
  }
}
