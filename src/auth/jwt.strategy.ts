// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { environment } from '../config/environment';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.JWT_SECRET || 'ClaveSecretaJWT',
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token no válido o expirado');
    }

    return {
      id: payload.sub || payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
