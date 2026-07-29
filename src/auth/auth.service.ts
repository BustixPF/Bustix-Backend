// auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
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

  if (!user) {
    user = await this.usersRepository.createGoogleUser({
      email,
      name: `${firstName} ${lastName}`.trim(),
      profilePicture: picture,
    });
  }

  // Estructura idéntica a signIn para no romper la lectura de cookies
  const payload = { id: user.id, email: user.email, role: user.role };

  const token = this.jwtService.sign(payload);

  return {
    message: 'Inicio de sesión con Google exitoso',
    user,
    token,
  };
}

  async signIn(email: string, pass: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { id: user.id, email: user.email, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: '¡Bienvenido de nuevo!',
      token: token,
    };
  }

  async signUp(userDto: CreateUserDto) {
    const cleanEmail = userDto.email.trim().toLowerCase();

    const existUser = await this.usersRepository.getUserByEmail(cleanEmail);
    if (existUser) {
      throw new ConflictException('El usuario ya existe');
    }

    if (userDto.password !== userDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const newUser = await this.usersRepository.addUser({
      ...userDto,
      email: cleanEmail,
      password: hashedPassword,
    });

    void this.notificationsService
      .sendWelcomeEmail({
        email: newUser.email,
        name: newUser.name,
      })
      .catch(() => {});

    return {
      id: newUser,
      message: 'Usuario registrado con éxito',
    };
  }
}