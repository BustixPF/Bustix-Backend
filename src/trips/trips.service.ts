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
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';

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
      status: TripStatus.ON_TIME,
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

  async findAllForSuperAdmin() {
    const trips = await this.tripsRepository.find({
      relations: {
        route: true,
        seats: true,
        company: true,
      },
      order: { departureDate: 'DESC' },
    });

    return trips.map((trip) => {
      const seats = trip.seats || [];
      const soldSeatsCount = seats.filter(
        (s) => s.status === SeatStatus.Sold,
      ).length;
      const reservedSeatsCount = seats.filter(
        (s) => s.status === SeatStatus.Reserved,
      ).length;
      const availableSeatsCount = seats.filter(
        (s) => s.status === SeatStatus.Available,
      ).length;

      return {
        id: trip.id,
        companyId: trip.companyId,
        origin: trip.origin,
        destination: trip.destination,
        departureDate: trip.departureDate,
        price: trip.price,
        totalSeats: trip.totalSeats,
        status: (trip as any).status || 'ACTIVE',
        route: trip.route
          ? {
              id: trip.route.id,
              origin: trip.route.origin,
              destination: trip.route.destination,
              duration: trip.route.duration,
              price: trip.route.price,
              companyId: trip.route.companyId,
            }
          : null,
        occupancy: {
          total: trip.totalSeats,
          sold: soldSeatsCount,
          reserved: reservedSeatsCount,
          available: availableSeatsCount,
        },
      };
    });
  }

  async findOne(id: string) {
    const trip = await this.tripsRepository.findOne({
      where: { id },
      relations: {
        company: true,
        route: true,
        seats: true,
      },
    });
    if (!trip)
      throw new NotFoundException(`No se encontró el viaje con id ${id}`);
    return trip;
  }

  async updateStatus(id: string, dto: UpdateTripStatusDto) {
    const trip = await this.findOne(id);

    if (dto.status === TripStatus.RESCHEDULED && dto.newDepartureDate) {
      trip.departureDate = new Date(dto.newDepartureDate);
      trip.status = TripStatus.ON_TIME;
    } else {
      trip.status = dto.status;
    }

    return this.tripsRepository.save(trip);
  }

  async findAvailableSeats(tripId: string) {
  // Trae los asientos del viaje cuyo estado NO sea ocupado por un pago verificado
  return await this.seatsRepository.find({
    where: {
      trip: { id: tripId },
      status: SeatStatus.Available, // O asegura que no dependa de un 'RESERVED' huérfano
    },
    order: { seatNumber: 'ASC' },
  });
}

  async updateStatusBySuperAdmin(id: string, status: string) {
    const trip = await this.tripsRepository.findOne({
      where: { id },
      relations: { seats: true },
    });

    if (!trip) {
      throw new NotFoundException(`Viaje con id ${id} no encontrado`);
    }

    if (status === 'CANCELLED' || status === 'INACTIVE') {
      const seats = trip.seats || [];
      const soldSeats = seats.filter((s) => s.status === SeatStatus.Sold).length;

      if (soldSeats > 0) {
        throw new BadRequestException(
          `No se puede cambiar el estado a ${status} porque el viaje tiene ${soldSeats} pasaje(s) vendido(s).`,
        );
      }
    }

    (trip as any).status = status;
    const updatedTrip = await this.tripsRepository.save(trip);

    return {
      id: updatedTrip.id,
      companyId: updatedTrip.companyId,
      origin: updatedTrip.origin,
      destination: updatedTrip.destination,
      departureDate: updatedTrip.departureDate,
      price: updatedTrip.price,
      totalSeats: updatedTrip.totalSeats,
      status: (updatedTrip as any).status || status,
      message: `El estado del viaje se actualizó correctamente a ${status}.`,
    };
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

  async releaseSeats(seatIds: string[]) {
    if (!seatIds || seatIds.length === 0) return;
    await this.seatsRepository
      .createQueryBuilder()
      .update(Seat)
      .set({ status: SeatStatus.Available })
      .where('id IN (:...seatIds) AND status != :soldStatus', {
        seatIds,
        soldStatus: SeatStatus.Sold,
      })
      .execute();
  }

  // Cron job para actualizar estado del viaje
  @Cron(CronExpression.EVERY_MINUTE)
  async updateTripsStatus() {
    const trips = await this.tripsRepository.find();
    const now = new Date();

    for (const trip of trips) {
      const MANUAL_STATUSES = [
        TripStatus.CANCELLED,
        TripStatus.DELAYED,
        TripStatus.RESCHEDULED,
      ];
      if (MANUAL_STATUSES.includes(trip.status)) continue;

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