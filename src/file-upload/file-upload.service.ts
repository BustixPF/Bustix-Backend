import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileRepo: FileUploadRepository,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // 📂 Subida de archivos para empresa
  async uploadFile(file: Express.Multer.File, companyId: string) {
    return this.fileRepo.saveFile(file, companyId);
  }

  async getCompanyDocuments(companyId: string) {
    return this.fileRepo.findByCompany(companyId);
  }

  // Actualización de foto de perfil de usuario
  async uploadUserProfilePicture(file: Express.Multer.File, userId: string) {
    const result = await this.fileRepo.uploadImage(file);

    await this.userRepo.update(userId, { profilePicture: result.secure_url });

    return {
      message: 'Foto de perfil actualizada exitosamente',
      profilePictureUrl: result.secure_url,
    };
  }
}
