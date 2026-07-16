import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../common/roles.enum';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const routRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new ForbiddenException('Usuario no autenticado.');
    }

    const userRoles = request.user.roles;

    const isAllowed = routRoles.some((role) => userRoles.includes(role));
    if (!isAllowed) {
      throw new ForbiddenException('Usuario no autenticado.');
    }
    return true;
  }
}
