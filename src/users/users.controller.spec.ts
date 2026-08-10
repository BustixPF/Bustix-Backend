import { ForbiddenException } from '@nestjs/common';
import { Role } from '../common/roles.enum';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController authorization', () => {
  const usersService = {
    findOne: jest.fn(),
    update: jest.fn(),
  } as unknown as UsersService;
  const controller = new UsersController(usersService);

  const request = (id: string, role: Role): AuthenticatedRequest =>
    ({
      user: { id, email: `${id}@example.com`, role },
    }) as AuthenticatedRequest;

  it('rejects users requesting another user record', () => {
    expect(() =>
      controller.findOne('user-2', request('user-1', Role.User)),
    ).toThrow(ForbiddenException);
  });

  it('rejects admins editing arbitrary users', () => {
    expect(() =>
      controller.update(
        'user-2',
        { name: 'Usuario actualizado' },
        request('admin-1', Role.Admin),
      ),
    ).toThrow(ForbiddenException);
  });

  it('rejects self-service role escalation', () => {
    expect(() =>
      controller.update(
        'user-1',
        { role: Role.superAdmin },
        request('user-1', Role.User),
      ),
    ).toThrow(ForbiddenException);
  });
});
