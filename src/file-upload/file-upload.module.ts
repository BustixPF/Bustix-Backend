import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FileUploadRepository } from './file-upload.repository';
import { Company } from '../companies/entities/company.entity';
import { Document } from './entities/file-uplaod.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Company])],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository],
  exports: [FileUploadService],
})
export class FileUploadModule {}
