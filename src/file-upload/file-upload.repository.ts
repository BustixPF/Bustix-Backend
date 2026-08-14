import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
import { CompanyStatus } from '../common/company-status.enum';

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

  private async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';

      const uploadStream = this.cloudinaryProvider.uploader.upload_stream(
        { resource_type: resourceType, folder: 'companies' },
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

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  // Subida de imagen para perfil de usuario
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryProvider.uploader.upload_stream(
        { resource_type: 'image', folder: 'users/profile-pictures' },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(
              new Error(error?.message || 'Error al subir imagen a Cloudinary'),
            );
          }
          resolve(result);
        },
      );

      if (!file || !file.buffer) {
        return reject(new Error('El archivo no tiene buffer'));
      }

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

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
    return this.saveCompanyFile(file, company);
  }

  async saveRegistrationFile(
    file: Express.Multer.File,
    companyId: string,
  ): Promise<Document> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Empresa con id ${companyId} no encontrada`);
    }
    if (company.status !== CompanyStatus.PENDING) {
      throw new ForbiddenException(
        'Solo las empresas pendientes pueden subir documentos de registro',
      );
    }

    return this.saveCompanyFile(file, company);
  }

  private async saveCompanyFile(
    file: Express.Multer.File,
    company: Company,
  ): Promise<Document> {
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
