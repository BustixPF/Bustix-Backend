import { EntityManager, In } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Route } from '../routes/entities/routes.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Seat, SeatStatus } from '../trips/entities/seat.entity';
import { allTrips } from '../utils/trips.data';

const routeKey = (companyId: string, origin: string, destination: string) =>
  `${companyId}|${origin}|${destination}`;

const tripKey = (
  companyId: string,
  origin: string,
  destination: string,
  departureDate: Date,
) => `${routeKey(companyId, origin, destination)}|${departureDate.getTime()}`;

export async function seedTrips(manager: EntityManager): Promise<number> {
  const companyRepo = manager.getRepository(Company);
  const routeRepo = manager.getRepository(Route);
  const tripRepo = manager.getRepository(Trip);
  const seatRepo = manager.getRepository(Seat);
  const nits = [...new Set(allTrips.map((trip) => trip.nit))];
  const companies = await companyRepo.find({ where: { nit: In(nits) } });
  const companiesByNit = new Map(
    companies.map((company) => [company.nit, company]),
  );
  const companyIds = companies.map((company) => company.id);
  const routes = companyIds.length
    ? await routeRepo.find({ where: { companyId: In(companyIds) } })
    : [];
  const routesByKey = new Map(
    routes.map((route) => [
      routeKey(route.companyId, route.origin, route.destination),
      route,
    ]),
  );
  const departureDates = [
    ...new Set(allTrips.map((trip) => trip.departureDate.getTime())),
  ].map((timestamp) => new Date(timestamp));
  const existingTrips =
    companyIds.length && departureDates.length
      ? await tripRepo.find({
          where: {
            companyId: In(companyIds),
            departureDate: In(departureDates),
          },
        })
      : [];
  const existingKeys = new Set(
    existingTrips.map((trip) =>
      tripKey(
        trip.companyId,
        trip.origin,
        trip.destination,
        trip.departureDate,
      ),
    ),
  );
  const missingTrips: Trip[] = [];

  for (const tripData of allTrips) {
    const company = companiesByNit.get(tripData.nit);
    if (!company) continue;

    const route = routesByKey.get(
      routeKey(company.id, tripData.origin, tripData.destination),
    );
    if (!route) continue;

    const key = tripKey(
      company.id,
      tripData.origin,
      tripData.destination,
      tripData.departureDate,
    );
    if (existingKeys.has(key)) continue;

    missingTrips.push(
      tripRepo.create({
        companyId: company.id,
        company,
        route,
        origin: route.origin,
        destination: route.destination,
        departureDate: tripData.departureDate,
        price: tripData.price,
        totalSeats: tripData.totalSeats,
      }),
    );
    existingKeys.add(key);
  }

  if (missingTrips.length === 0) return 0;

  const savedTrips = await tripRepo.save(missingTrips, { chunk: 100 });
  const seats = savedTrips.flatMap((trip) =>
    Array.from({ length: trip.totalSeats }, (_, index) =>
      seatRepo.create({
        tripId: trip.id,
        trip,
        seatNumber: index + 1,
        status: SeatStatus.Available,
      }),
    ),
  );

  await seatRepo.save(seats, { chunk: 500 });

  return savedTrips.length;
}
