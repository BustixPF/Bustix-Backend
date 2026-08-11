import { EntityManager } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Route } from '../routes/entities/routes.entity';
import { Seat } from '../trips/entities/seat.entity';
import { Trip } from '../trips/entities/trip.entity';
import { allTrips } from '../utils/trips.data';
import { seedTrips } from './trips.seeder';

describe('seedTrips', () => {
  const companies = [...new Set(allTrips.map((trip) => trip.nit))].map(
    (nit, index) => ({ id: `company-${index}`, nit }) as Company,
  );
  const companyByNit = new Map(
    companies.map((company) => [company.nit, company]),
  );
  const routesByKey = new Map<string, Route>();

  for (const trip of allTrips) {
    const company = companyByNit.get(trip.nit)!;
    const key = `${company.id}|${trip.origin}|${trip.destination}`;
    routesByKey.set(key, {
      id: routesByKey.size + 1,
      companyId: company.id,
      origin: trip.origin,
      destination: trip.destination,
    } as Route);
  }

  const routes = [...routesByKey.values()];
  const seededTrips = allTrips.map((trip, index) => {
    const company = companyByNit.get(trip.nit)!;
    return {
      id: `trip-${index}`,
      companyId: company.id,
      origin: trip.origin,
      destination: trip.destination,
      departureDate: trip.departureDate,
      price: trip.price,
      totalSeats: trip.totalSeats,
    } as Trip;
  });

  const createManager = (existingTrips: Trip[]) => {
    const saveTrips = jest.fn((trips: Trip[]) =>
      Promise.resolve(
        trips.map((trip, index) => ({ ...trip, id: `new-trip-${index}` })),
      ),
    );
    const saveSeats = jest.fn((seats: Seat[]) => Promise.resolve(seats));
    const repositories = new Map<unknown, unknown>([
      [Company, { find: jest.fn().mockResolvedValue(companies) }],
      [Route, { find: jest.fn().mockResolvedValue(routes) }],
      [
        Trip,
        {
          find: jest.fn().mockResolvedValue(existingTrips),
          create: jest.fn((trip: Trip) => trip),
          save: saveTrips,
        },
      ],
      [
        Seat,
        {
          create: jest.fn((seat: Seat) => seat),
          save: saveSeats,
        },
      ],
    ]);
    const manager = {
      getRepository: jest.fn((entity: unknown) => repositories.get(entity)),
    } as unknown as EntityManager;

    return { manager, saveTrips, saveSeats };
  };

  it('does not create trips or seats when seed data already exists', async () => {
    const { manager, saveTrips, saveSeats } = createManager(seededTrips);

    await expect(seedTrips(manager)).resolves.toBe(0);
    expect(saveTrips).not.toHaveBeenCalled();
    expect(saveSeats).not.toHaveBeenCalled();
  });

  it('creates only missing trips and batches their seats', async () => {
    const { manager, saveTrips, saveSeats } = createManager(
      seededTrips.slice(1),
    );

    await expect(seedTrips(manager)).resolves.toBe(1);
    expect(saveTrips).toHaveBeenCalledTimes(1);
    expect(saveSeats).toHaveBeenCalledTimes(1);
    expect(saveSeats.mock.calls[0][0]).toHaveLength(allTrips[0].totalSeats);
  });
});
