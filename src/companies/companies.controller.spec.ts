import { CompanyStatus } from '../common/company-status.enum';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

describe('CompaniesController public listing', () => {
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
    const controller = new CompaniesController(companiesService);

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
