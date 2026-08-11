import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  updateFileUserDecorator,
  uploadToCloudinaryDecorator,
} from './file-upload.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Role } from '../common/roles.enum';

@ApiTags('FileUpload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('company/:companyId')
  @uploadToCloudinaryDecorator()
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
    @Req() req: AuthenticatedRequest,
  ) {
    if (
      req.user?.role !== Role.superAdmin &&
      (req.user?.role !== Role.Admin || req.user.companyId !== companyId)
    ) {
      throw new ForbiddenException('No podés subir archivos a otra empresa');
    }
    return this.fileUploadService.uploadFile(file, companyId);
  }

  @Post('user/:userId')
  @updateFileUserDecorator()
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
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.role !== Role.superAdmin && req.user?.id !== userId) {
      throw new ForbiddenException('No podés subir archivos a otro usuario');
    }
    return this.fileUploadService.uploadFile(file, userId);
  }
}
