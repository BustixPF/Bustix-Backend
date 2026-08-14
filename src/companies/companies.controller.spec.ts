import { CompanyStatus } from '../common/company-status.enum';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CompanyUploadTokenService } from '../file-upload/company-upload-token.service';

describe('CompaniesController public listing', () => {
  it('returns a scoped document upload token after company creation', async () => {
    const company = {
      id: 'company-1',
      name: 'BusTix Express',
      status: CompanyStatus.PENDING,
      password: 'hashed-password',
    } as Company;
    const companiesService = {
      createCompany: jest.fn().mockResolvedValue(company),
    } as unknown as CompaniesService;
    const issueUploadToken = jest.fn().mockResolvedValue('upload-token');
    const companyUploadTokenService = {
      issue: issueUploadToken,
    } as unknown as CompanyUploadTokenService;
    const controller = new CompaniesController(
      companiesService,
      companyUploadTokenService,
    );

    const result = await controller.create({} as never);

    expect(issueUploadToken).toHaveBeenCalledWith('company-1');
    expect(result).toEqual(
      expect.objectContaining({
        id: 'company-1',
        documentUploadToken: 'upload-token',
        documentUploadTokenExpiresIn: 1800,
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('returns approved companies without exposing their password', async () => {
    const company = {
      id: 'company-1',
      name: 'BusTix Express',
      status: CompanyStatus.APPROVED,
      password: 'hashed-password',
    } as Company;
    const findPublicCompanies = jest.fn().mockResolvedValue([company]);
    const companiesService = {
      findPublicCompanies,
    } as unknown as CompaniesService;
    const companyUploadTokenService = {} as CompanyUploadTokenService;
    const controller = new CompaniesController(
      companiesService,
      companyUploadTokenService,
    );

    const result = await controller.findAll();

    expect(findPublicCompanies).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      expect.objectContaining({
        id: 'company-1',
        status: CompanyStatus.APPROVED,
      }),
    ]);
    expect(result[0]).not.toHaveProperty('password');
  });
});
