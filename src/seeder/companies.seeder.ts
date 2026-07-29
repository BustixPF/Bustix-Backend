import { DataSource } from 'typeorm';
import { allCompanies } from '../utils/companies.data';
import { Company } from '../companies/entities/company.entity';

export async function seedCompanies(dataSource: DataSource) {
  const companyRepo = dataSource.getRepository(Company);

  for (const companyData of allCompanies) {
    const existing = await companyRepo.findOneBy({ nit: companyData.nit });
    if (!existing) {
      await companyRepo.save(companyRepo.create(companyData));
    }
  }

  console.log('✅ Empresas de prueba cargadas automáticamente');
}
