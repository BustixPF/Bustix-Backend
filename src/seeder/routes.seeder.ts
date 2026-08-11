import { EntityManager, In } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { allRoutes } from '../utils/routes.data';
import { Route } from '../routes/entities/routes.entity';

const routeKey = (companyId: string, origin: string, destination: string) =>
  `${companyId}|${origin}|${destination}`;

export async function seedRoutes(manager: EntityManager): Promise<number> {
  const routeRepo = manager.getRepository(Route);
  const companyRepo = manager.getRepository(Company);
  const nits = [...new Set(allRoutes.map((route) => route.nit))];
  const companies = await companyRepo.find({ where: { nit: In(nits) } });
  const companiesByNit = new Map(
    companies.map((company) => [company.nit, company]),
  );
  const companyIds = companies.map((company) => company.id);
  const existingRoutes = companyIds.length
    ? await routeRepo.find({ where: { companyId: In(companyIds) } })
    : [];
  const existingKeys = new Set(
    existingRoutes.map((route) =>
      routeKey(route.companyId, route.origin, route.destination),
    ),
  );
  const missingRoutes: Route[] = [];

  for (const routeData of allRoutes) {
    const company = companiesByNit.get(routeData.nit);
    if (!company) continue;

    const key = routeKey(company.id, routeData.origin, routeData.destination);
    if (existingKeys.has(key)) continue;

    missingRoutes.push(
      routeRepo.create({
        origin: routeData.origin,
        destination: routeData.destination,
        duration: routeData.duration,
        price: routeData.price,
        companyId: company.id,
        company,
      }),
    );
    existingKeys.add(key);
  }

  if (missingRoutes.length > 0) {
    await routeRepo.save(missingRoutes, { chunk: 100 });
  }

  return missingRoutes.length;
}
