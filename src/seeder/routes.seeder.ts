import { DataSource } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { allRoutes } from '../utils/routes.data';
import { Route } from '../routes/entities/routes.entity';

export async function seedRoutes(dataSource: DataSource) {
  const routeRepo = dataSource.getRepository(Route);
  const companyRepo = dataSource.getRepository(Company);

  for (const routeData of allRoutes) {
    const company = await companyRepo.findOneBy({ nit: routeData.nit });
    if (!company) {
      console.warn(
        `⚠️ Empresa con NIT ${routeData.nit} no encontrada para ruta ${routeData.origin} → ${routeData.destination}`,
      );
      continue;
    }

    const existing = await routeRepo.findOne({
      where: {
        origin: routeData.origin,
        destination: routeData.destination,
        company: { id: company.id },
      },
      relations: { company: true },
    });

    if (!existing) {
      await routeRepo.save(routeRepo.create({ ...routeData, company }));
    }
  }

  console.log(`✅ Seeder de rutas ejecutado 🚍, count: ${allRoutes.length}`);
}
