import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { environment } from '../config/environment';
import { Role } from '../common/roles.enum';
import { UsersRepository } from '../users/users.repository';
import { User } from '../users/entities/user.entity';
import { CompanyStatus } from '../common/company-status.enum';

interface JwtPayload {
  id?: string;
  sub?: string;
  email?: string;
  role?: Role;
  companyId?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Extrae desde la cookie HttpOnly
        (req: Request) => {
          const cookies: unknown = req.cookies;
          if (cookies && typeof cookies === 'object') {
            const token = (cookies as Record<string, unknown>).token;
            return typeof token === 'string' ? token : null;
          }
          return null;
        },
        // 2. Fallback para Header Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: environment.JWT_SECRET,
    });
  }

 async validate(payload: JwtPayload) {
    const userId = payload.id ?? payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Token no válido o expirado');
    }

    // Usamos findOne para incluir las relaciones (company)
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('El usuario del token ya no existe');
    }

    // 1. Validar estado del usuario
   if (user.isActive === false) {
  throw new UnauthorizedException(
    'Esta cuenta de usuario se encuentra desactivada.',
  );
}

    // 2. Validar estado de la empresa asociada (para admins/empleados)
    if (user.company) {
  if (user.company.isActive === false) {
    throw new UnauthorizedException(
      'La empresa asociada a esta cuenta ha sido suspendida/desactivada.',
    );
  }
      if (user.company.status !== CompanyStatus.APPROVED) {
    throw new UnauthorizedException(
      'La empresa asociada aún no ha sido aprobada.',
    );
  }
}

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company?.id ?? user.companyId ?? null,
    };
  }
}


