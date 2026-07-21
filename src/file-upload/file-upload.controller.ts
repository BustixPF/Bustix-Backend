import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('FileUpload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('company/:companyId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFileCompany(
    @UploadedFile() file: Express.Multer.File,
    @Param('companyId') companyId: string,
  ) {
    return this.fileUploadService.uploadFile(file, companyId);
  }

  @Post('user/:userId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFileUser(
    @UploadedFile() file: Express.Multer.File,
    @Param('companyId') companyId: string,
  ) {
    return this.fileUploadService.uploadFile(file, companyId);
  }
}
