import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  ParseFilePipe,
} from '@nestjs/common';
import { MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Role } from '../common/roles.enum';
import { CompanyRegistrationUploadGuard } from './company-registration-upload.guard';

@ApiTags('FileUpload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('company/:companyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadFileCompany(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|docx)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
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

  @Post('company/:companyId/registration')
  @UseGuards(CompanyRegistrationUploadGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir un documento durante el registro de una empresa',
    description:
      'No requiere sesión. Usa el token temporal entregado por POST /companies.',
  })
  @ApiHeader({
    name: 'X-Company-Upload-Token',
    description: 'Token temporal y exclusivo de la empresa recién creada',
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido correctamente' })
  @ApiResponse({
    status: 401,
    description: 'Token temporal ausente, inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'La empresa ya no está pendiente de aprobación',
  })
  async uploadCompanyRegistrationFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|docx)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('companyId') companyId: string,
  ) {
    return this.fileUploadService.uploadRegistrationFile(file, companyId);
  }

  // Actualización de foto de perfil del usuario
  @Post('user/:userId/profile-picture')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateProfilePicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif|avif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.role !== Role.superAdmin && req.user?.id !== userId) {
      throw new ForbiddenException(
        'No podés actualizar la foto de otro usuario',
      );
    }
    return this.fileUploadService.uploadUserProfilePicture(file, userId);
  }
}
