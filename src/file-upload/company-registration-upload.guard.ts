import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CompanyUploadTokenService } from './company-upload-token.service';

@Injectable()
export class CompanyRegistrationUploadGuard implements CanActivate {
  constructor(
    private readonly companyUploadTokenService: CompanyUploadTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.header('x-company-upload-token');
    const companyId = request.params.companyId;

    if (!token || typeof companyId !== 'string') {
      throw new UnauthorizedException(
        'Token de carga de documentos no proporcionado',
      );
    }

    await this.companyUploadTokenService.verify(token, companyId);
    return true;
  }
}
