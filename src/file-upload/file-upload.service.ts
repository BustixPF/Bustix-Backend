import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';

@Injectable()
export class FileUploadService {
  constructor(private readonly fileRepo: FileUploadRepository) {}

  async uploadFile(file: Express.Multer.File, companyId: string) {
    return this.fileRepo.saveFile(file, companyId);
  }

  async getCompanyDocuments(companyId: string) {
    return this.fileRepo.findByCompany(companyId);
  }
}
