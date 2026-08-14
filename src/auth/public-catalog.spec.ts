import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CompaniesController } from '../companies/companies.controller';
import { PaymentsController } from '../payments/payments.controller';
import { RoutesController } from '../routes/routes.controller';
import { TripsController } from '../trips/trips.controller';

describe('Public catalog authorization', () => {
  const getHandler = (controller: object, methodName: string): object => {
    const handler: unknown = Object.getOwnPropertyDescriptor(
      controller,
      methodName,
    )?.value;
    if (typeof handler !== 'function') {
      throw new Error(`No se encontró el método ${methodName}`);
    }
    return handler;
  };

  it.each([
    ['companies', CompaniesController, 'findAll'],
    ['routes', RoutesController, 'findAll'],
    ['trips', TripsController, 'findAll'],
    ['upcoming trips', TripsController, 'getUpcomingTrips'],
    ['available seats', TripsController, 'findAvailableSeats'],
  ])(
    'keeps %s available without an authentication guard',
    (_, controller, methodName) => {
      const handler = getHandler(controller.prototype, methodName);
      expect(Reflect.getMetadata(GUARDS_METADATA, controller)).toBeUndefined();
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toBeUndefined();
    },
  );

  it.each([
    ['route creation', RoutesController.prototype, 'create'],
    ['trip creation', TripsController.prototype, 'create'],
    ['checkout', PaymentsController.prototype, 'createCheckoutSession'],
  ])('keeps %s protected', (_, controller, methodName) => {
    const handler = getHandler(controller, methodName);
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toBeDefined();
  });
});
