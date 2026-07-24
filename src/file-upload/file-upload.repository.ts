import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/file-uplaod.entity';
import { Company } from '../companies/entities/company.entity';
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class FileUploadRepository {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @Inject('CLOUDINARY')
    private readonly cloudinaryProvider: typeof cloudinary,
  ) {}

  // Método interno para subir a Cloudinary
  private async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryProvider.uploader.upload_stream(
        { resource_type: 'auto', folder: 'companies' },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(
              new Error(error?.message || 'Error al subir a Cloudinary'),
            );
          }
          resolve(result);
        },
      );

      if (!file || !file.buffer) {
        return reject(new Error('El archivo no tiene buffer'));
      }

      // Usamos la API oficial de Node para crear el stream
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  // Método público que usa uploadToCloudinary y guarda en la DB
  async saveFile(
    file: Express.Multer.File,
    companyId: string,
  ): Promise<Document> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Empresa con id ${companyId} no encontrada`);
    }

    const result = await this.uploadToCloudinary(file);

    const document = this.documentRepo.create({
      filename: file.originalname,
      url: result.secure_url,
      mimetype: file.mimetype,
      company,
    });

    return this.documentRepo.save(document);
  }

  async findByCompany(companyId: string): Promise<Document[]> {
    return this.documentRepo.find({
      where: { company: { id: companyId } },
      relations: { company: true },
    });
  }
}
