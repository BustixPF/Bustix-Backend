import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadRepository } from './file-upload.repository';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { Document } from './entities/file-uplaod.entity';
import { Company } from '../companies/entities/company.entity';
import { CloudinaryConfig } from '../config/claudinary';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { environment } from '../config/environment';
import { CompanyUploadTokenService } from './company-upload-token.service';
import { CompanyRegistrationUploadGuard } from './company-registration-upload.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Company, User]),
    JwtModule.register({ secret: environment.JWT_SECRET }),
  ],
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    FileUploadRepository,
    CloudinaryConfig,
    CompanyUploadTokenService,
    CompanyRegistrationUploadGuard,
  ],
  exports: [FileUploadService, CompanyUploadTokenService],
})
export class FileUploadModule {}
