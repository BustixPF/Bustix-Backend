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

    if (!user) {
      user = await this.usersRepository.createGoogleUser({
        email,
        name: `${firstName} ${lastName}`.trim(),
        profilePicture: picture,
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
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

      // Envío asíncrono del mail sin bloquear el registro
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

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
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
