import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      // Cuidado con dejar la clave Hardcodeada chicos, dejo el comentario para recuerdo (P)
      secret: 'ClaveSecretaJWT',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  // Registre los guards para poder usarlos en otros módulos
  providers: [AuthService, RolesGuard, JwtAuthGuard],
  exports: [JwtModule, RolesGuard, JwtAuthGuard],
})
export class AuthModule {}
