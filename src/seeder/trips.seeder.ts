import { DataSource } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Route } from '../routes/entities/routes.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Seat, SeatStatus } from '../trips/entities/seat.entity';
import { allTrips } from '../utils/trips.data';

export async function seedTrips(dataSource: DataSource) {
  const companyRepo = dataSource.getRepository(Company);
  const routeRepo = dataSource.getRepository(Route);
  const tripRepo = dataSource.getRepository(Trip);
  const seatRepo = dataSource.getRepository(Seat);

  for (const tripData of allTrips) {
    const company = await companyRepo.findOneBy({ nit: tripData.nit });
    if (!company) {
      console.warn(`⚠️ Empresa con NIT ${tripData.nit} no encontrada`);
      continue;
    }

    const route = await routeRepo.findOne({
      where: {
        origin: tripData.origin,
        destination: tripData.destination,
        company: { id: company.id },
      },
      relations: { company: true },
    });

    if (!route) {
      console.warn(
        `⚠️ No se encontró ruta ${tripData.origin} → ${tripData.destination} para empresa ${company.name}`,
      );
      continue;
    }

    const trip = tripRepo.create({
      origin: route.origin,
      destination: route.destination,
      departureDate: tripData.departureDate,
      price: tripData.price,
      totalSeats: tripData.totalSeats,
      company,
      route,
    });

    const savedTrip = await tripRepo.save(trip);

    const seats = Array.from({ length: tripData.totalSeats }, (_, i) =>
      seatRepo.create({
        trip: savedTrip,
        seatNumber: i + 1,
        status: SeatStatus.Available, // 👈 ahora sí compila
      }),
    );
    await seatRepo.save(seats);

    console.log(
      `✅ Trip creado: ${tripData.origin} → ${tripData.destination} (${tripData.departureDate.toLocaleString()})`,
    );
  }
}
