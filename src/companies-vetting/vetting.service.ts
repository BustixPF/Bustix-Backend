import { Injectable } from '@nestjs/common';
import { VettingRepository } from './vetting.repository';

@Injectable()
export class VettingService {
  constructor(private readonly vettingRepo: VettingRepository) {}

  async verifyCompany(companyId: string, fileUrl: string) {
    return this.vettingRepo.createRecord(companyId, fileUrl);
  }

  async changeStatus(
    id: string,
    status: 'approved' | 'rejected',
    notes?: string,
  ) {
    return this.vettingRepo.updateStatus(id, status, notes);
  }

  async getCompanyRecords(companyId: string) {
    return this.vettingRepo.findByCompany(companyId);
  }
}
