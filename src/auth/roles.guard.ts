import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../common/roles.enum';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

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

    // Si no hay roles definidos queda por defecto (sin restriccion)
    if (!routRoles || routRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Si no existe user en el request => no autenticado
    if (!request.user) {
      throw new ForbiddenException('Usuario no autenticado.');
    }

    const userRoleField = request.user.role ?? request.user.roles;

    if (!userRoleField) {
      throw new ForbiddenException('Usuario sin roles asignados.');
    }

    const userRoles: Role[] = Array.isArray(userRoleField)
      ? userRoleField
      : [userRoleField];

    const isAllowed = routRoles.some((role) => userRoles.includes(role));

    // Cambie usuario no autenticados por este nuevo mensaje ahora que hay roles.
    if (!isAllowed) {
      throw new ForbiddenException('Acceso denegado: rol insuficiente.');
    }
    return true;
  }
}
