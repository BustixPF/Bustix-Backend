import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Document } from './entities/file-uplaod.entity';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileRepo: FileUploadRepository,
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async uploadFile(file: Express.Multer.File, companyId: string) {
    // 1. Buscar la empresa en BD
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    // 2. Subir archivo a Cloudinary
    const result = await this.fileRepo.uploadToCloudinary(file);

    // 3. Crear registro en BD
    const doc = this.documentRepo.create({
      url: result.secure_url,
      filename: file.originalname,
      mimetype: file.mimetype,
      company,
    });

    return this.documentRepo.save(doc);
  }
}
