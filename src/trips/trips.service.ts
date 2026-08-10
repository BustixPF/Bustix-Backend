import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { Seat, SeatStatus } from './entities/seat.entity';
import { Route } from '../routes/entities/routes.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripStatus } from '../common/trip-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip) private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(Seat) private readonly seatsRepository: Repository<Seat>,
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
  ) {}

  async create(dto: CreateTripDto) {
    const route = await this.routesRepository.findOne({
      where: { id: dto.routeId },
    });
    if (!route) {
      throw new NotFoundException(
        `No se encontró la ruta con id ${dto.routeId}`,
      );
    }
    if (route.companyId !== dto.companyId) {
      throw new BadRequestException(
        'La ruta no pertenece a la empresa indicada',
      );
    }

    const trip = this.tripsRepository.create({
      companyId: dto.companyId,
      origin: dto.origin,
      destination: dto.destination,
      departureDate: new Date(dto.departureDate),
      price: dto.price,
      totalSeats: dto.totalSeats,
      route,
      status: TripStatus.ON_TIME, // 👈 estado inicial
    });
    const savedTrip = await this.tripsRepository.save(trip);

    const seats = Array.from({ length: dto.totalSeats }, (_, i) =>
      this.seatsRepository.create({
        tripId: savedTrip.id,
        seatNumber: i + 1,
        status: SeatStatus.Available,
      }),
    );
    await this.seatsRepository.save(seats);
    return this.findOne(savedTrip.id);
  }

  findAll() {
    return this.tripsRepository.find({ order: { departureDate: 'ASC' } });
  }

  async findOne(id: string) {
    const trip = await this.tripsRepository.findOne({
      where: { id },
      relations: { company: true },
    });
    if (!trip)
      throw new NotFoundException(`No se encontró el viaje con id ${id}`);
    return trip;
  }

  async findAvailableSeats(tripId: string) {
    await this.findOne(tripId);
    return this.seatsRepository.find({
      where: { tripId, status: SeatStatus.Available },
      order: { seatNumber: 'ASC' },
    });
  }

  async reserveSeat(tripId: string, seatId: string) {
    const seat = await this.seatsRepository.findOne({
      where: { id: seatId, tripId },
    });
    if (!seat)
      throw new NotFoundException('Asiento no encontrado para ese viaje');
    const result = await this.seatsRepository.update(
      { id: seatId, status: SeatStatus.Available },
      { status: SeatStatus.Reserved },
    );
    if (result.affected === 0) {
      throw new ConflictException('El asiento ya no está disponible');
    }
    return seat;
  }

  async markSeatAsSold(seatId: string) {
    await this.seatsRepository.update(
      { id: seatId },
      { status: SeatStatus.Sold },
    );
  }

  async findSeatById(seatId: string) {
    const seat = await this.seatsRepository.findOne({ where: { id: seatId } });
    if (!seat) throw new NotFoundException('Asiento no encontrado');
    return seat;
  }

  async releaseSeat(seatId: string) {
    await this.seatsRepository.update(
      { id: seatId, status: SeatStatus.Reserved },
      { status: SeatStatus.Available },
    );
  }

  // 👇 Cron job que corre cada minuto y actualiza estados
  @Cron(CronExpression.EVERY_MINUTE)
  async updateTripsStatus() {
    const trips = await this.tripsRepository.find();
    const now = new Date();

    for (const trip of trips) {
      if (trip.status === TripStatus.CANCELLED) continue;

      if (now >= trip.departureDate) {
        trip.status = TripStatus.DEPARTED;
      } else if (now >= new Date(trip.departureDate.getTime() - 30 * 60000)) {
        trip.status = TripStatus.BOARDING;
      } else {
        trip.status = TripStatus.ON_TIME;
      }

      await this.tripsRepository.save(trip);
    }
  }

  async getUpcomingTrips() {
    const now = new Date();
    return this.tripsRepository.find({
      where: { departureDate: MoreThan(now) },
      order: { departureDate: 'ASC' },
    });
  }
}
