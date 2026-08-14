import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  COMPANY_UPLOAD_TOKEN_EXPIRES_IN_SECONDS,
  CompanyUploadTokenService,
} from './company-upload-token.service';

describe('CompanyUploadTokenService', () => {
  const signAsync = jest.fn();
  const verifyAsync = jest.fn();
  const jwtService = {
    signAsync,
    verifyAsync,
  } as unknown as JwtService;
  const service = new CompanyUploadTokenService(jwtService);

  beforeEach(() => jest.clearAllMocks());

  it('issues a short-lived token scoped to the company registration', async () => {
    signAsync.mockResolvedValue('upload-token');

    await expect(service.issue('company-1')).resolves.toBe('upload-token');
    expect(signAsync).toHaveBeenCalledWith(
      {
        sub: 'company-1',
        purpose: 'company-registration-document-upload',
      },
      { expiresIn: COMPANY_UPLOAD_TOKEN_EXPIRES_IN_SECONDS },
    );
  });

  it('rejects a valid token when it belongs to another company', async () => {
    verifyAsync.mockResolvedValue({
      sub: 'company-2',
      purpose: 'company-registration-document-upload',
    });

    await expect(service.verify('upload-token', 'company-1')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects expired or malformed tokens', async () => {
    verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(service.verify('expired-token', 'company-1')).rejects.toThrow(
      'Token de carga de documentos inválido o expirado',
    );
  });
});
