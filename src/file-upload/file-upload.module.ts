import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadRepository } from './file-upload.repository';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { Document } from './entities/file-uplaod.entity';
import { Company } from '../companies/entities/company.entity';
import { CloudinaryConfig } from '../config/claudinary';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Company])],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository, CloudinaryConfig],
  exports: [FileUploadService],
})
export class FileUploadModule {}