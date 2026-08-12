import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/users.repository';
import { NotificationsService } from '../notifications/notifications.service';

interface GoogleLoginUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async googleLogin(reqUser: GoogleLoginUser | null | undefined) {
    if (!reqUser) {
      throw new BadRequestException(
        'No se recibieron datos del usuario desde Google',
      );
    }

    const { email, firstName, lastName, picture } = reqUser;
    let user = await this.usersRepository.findByEmail(email);

    if (user) {
      // 1. Validar si el usuario existente está desactivado
      if (user.isActive === false) {
        throw new UnauthorizedException(
          'Esta cuenta de usuario se encuentra desactivada. Contacte al administrador.',
        );
      }

      // 2. Validar si la empresa asociada está desactivada
      if (user.company && user.company.isActive === false) {
        throw new UnauthorizedException(
          'La empresa asociada a esta cuenta se encuentra desactivada.',
        );
      }
    } else {
      user = await this.usersRepository.createGoogleUser({
        email,
        name: `${firstName} ${lastName}`.trim(),
        profilePicture: picture,
      });
      await this.notificationsService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId ?? null,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Inicio de sesión con Google exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async signUp(userDto: CreateUserDto) {
    const cleanEmail = userDto.email.trim().toLowerCase();

    const existUser = await this.usersRepository.getUserByEmail(cleanEmail);
    if (existUser) {
      if (existUser.isActive === false) {
        throw new UnauthorizedException(
          'La cuenta asociada a este correo se encuentra desactivada.',
        );
      }
      throw new ConflictException('El usuario ya está registrado');
    }

    if (userDto.password !== userDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    try {
      const hashedPassword = await bcrypt.hash(userDto.password, 10);

      const newUser = await this.usersRepository.addUser({
        ...userDto,
        email: cleanEmail,
        password: hashedPassword,
      });

      this.notificationsService
        .sendWelcomeEmail({
          email: newUser.email,
          name: newUser.name,
        })
        .catch((err) =>
          console.error('Error enviando email de bienvenida:', err),
        );

      return {
        id: newUser.id,
        email: newUser.email,
        message: 'Usuario registrado con éxito',
      };
    } catch (error) {
      console.error('Error durante signUp:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error al crear la cuenta. Verifica los campos solicitados.',
      );
    }
  }

  async signIn(email: string, pass: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(cleanEmail);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 1. Validar estado del usuario
    if (user.isActive === false) {
      throw new UnauthorizedException(
        'Esta cuenta de usuario se encuentra desactivada. Contacte al administrador.',
      );
    }

    // 2. Validar estado de la empresa (si pertenece a una)
    if (user.company && user.company.isActive === false) {
      throw new UnauthorizedException(
        'La empresa asociada a esta cuenta se encuentra desactivada.',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Esta cuenta debe iniciar sesión con Google',
      );
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId ?? null,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: '¡Bienvenido de nuevo!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}