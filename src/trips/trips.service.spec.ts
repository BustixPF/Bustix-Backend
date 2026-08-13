import { FindOperator, Repository } from 'typeorm';
import { TripStatus } from '../common/trip-status.enum';
import { Route } from '../routes/entities/routes.entity';
import { Seat } from './entities/seat.entity';
import { Trip } from './entities/trip.entity';
import { TripsService } from './trips.service';

describe('TripsService.updateTripsStatus', () => {
  const updateCalls: Array<{ criteria: unknown; values: unknown }> = [];
  const updateTrips = jest.fn((criteria: unknown, values: unknown) => {
    updateCalls.push({ criteria, values });
    return Promise.resolve({ affected: 0, raw: [], generatedMaps: [] });
  });
  const tripsRepository = {
    update: updateTrips as Repository<Trip>['update'],
  } as unknown as Repository<Trip>;
  const service = new TripsService(
    tripsRepository,
    {} as Repository<Seat>,
    {} as Repository<Route>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    updateCalls.length = 0;
    jest.useFakeTimers().setSystemTime(new Date('2026-08-12T15:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('updates departed and boarding trips in two batch operations', async () => {
    await service.updateTripsStatus();

    const departedCriteria = updateCalls[0].criteria as {
      status: FindOperator<TripStatus>;
      departureDate: FindOperator<Date>;
    };
    const boardingCriteria = updateCalls[1].criteria as {
      status: TripStatus;
      departureDate: FindOperator<Date>;
    };

    expect(updateTrips).toHaveBeenCalledTimes(2);
    expect(departedCriteria.status.value).toEqual([
      TripStatus.ON_TIME,
      TripStatus.BOARDING,
    ]);
    expect(departedCriteria.departureDate.value).toEqual(
      new Date('2026-08-12T15:00:00.000Z'),
    );
    expect(updateCalls[0].values).toEqual({
      status: TripStatus.DEPARTED,
    });
    expect(boardingCriteria.status).toBe(TripStatus.ON_TIME);
    expect(boardingCriteria.departureDate.value).toEqual([
      new Date('2026-08-12T15:00:00.000Z'),
      new Date('2026-08-12T15:30:00.000Z'),
    ]);
    expect(updateCalls[1].values).toEqual({
      status: TripStatus.BOARDING,
    });
  });

  it('does not load or save individual trips', async () => {
    const findTrips = jest.fn();
    const saveTrip = jest.fn();
    Object.assign(tripsRepository, { find: findTrips, save: saveTrip });

    await service.updateTripsStatus();

    expect(findTrips).not.toHaveBeenCalled();
    expect(saveTrip).not.toHaveBeenCalled();
  });
});
