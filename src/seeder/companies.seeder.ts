import { EntityManager, In } from 'typeorm';
import { allCompanies } from '../utils/companies.data';
import { Company } from '../companies/entities/company.entity';

export async function seedCompanies(manager: EntityManager): Promise<number> {
  const companyRepo = manager.getRepository(Company);
  const nits = allCompanies.map((company) => company.nit);
  const existingCompanies = await companyRepo.find({
    select: { nit: true },
    where: { nit: In(nits) },
  });
  const existingNits = new Set(existingCompanies.map((company) => company.nit));
  const missingCompanies = allCompanies.filter(
    (company) => !existingNits.has(company.nit),
  );

  if (missingCompanies.length > 0) {
    await companyRepo.save(companyRepo.create(missingCompanies), {
      chunk: 100,
    });
  }

  return missingCompanies.length;
}
