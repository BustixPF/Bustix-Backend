import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const COMPANY_UPLOAD_TOKEN_PURPOSE = 'company-registration-document-upload';
export const COMPANY_UPLOAD_TOKEN_EXPIRES_IN_SECONDS = 30 * 60;

interface CompanyUploadTokenPayload {
  sub: string;
  purpose: typeof COMPANY_UPLOAD_TOKEN_PURPOSE;
}

@Injectable()
export class CompanyUploadTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async issue(companyId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: companyId,
        purpose: COMPANY_UPLOAD_TOKEN_PURPOSE,
      } satisfies CompanyUploadTokenPayload,
      { expiresIn: COMPANY_UPLOAD_TOKEN_EXPIRES_IN_SECONDS },
    );
  }

  async verify(token: string, companyId: string): Promise<void> {
    try {
      const payload =
        await this.jwtService.verifyAsync<CompanyUploadTokenPayload>(token);

      if (
        payload.sub !== companyId ||
        payload.purpose !== COMPANY_UPLOAD_TOKEN_PURPOSE
      ) {
        throw new UnauthorizedException();
      }
    } catch {
      throw new UnauthorizedException(
        'Token de carga de documentos inválido o expirado',
      );
    }
  }
}
