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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async googleLogin(reqUser: any) {
    if (!reqUser) {
      throw new BadRequestException(
        'No se recibieron datos del usuario desde Google',
      );
    }

    const { email, firstName, lastName, picture, accessToken } = reqUser;

    let user = await this.usersRepository.findByEmail(email);

    if (!user) {
      user = await this.usersRepository.createGoogleUser({
        email,
        name: `${firstName} ${lastName}`.trim(),
        profilePicture: picture,
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Inicio de sesión con Google exitoso',
      user,
      token,
    };
  }

  async signIn(email: string, pass: string) {
    // 1. Buscamos al usuario por su email
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificamos la contraseña
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generamos el payload para el JWT
    const payload = { id: user.id, email: user.email, role: user.role };

    // 4. Firmamos y devolvemos la respuesta coincidente con el Frontend
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

    // Guardamos con la clave hasheada
    const newUser = await this.usersRepository.addUser({
      ...userDto,
      email: cleanEmail,
      password: hashedPassword,
    });

    return {
      id: newUser,
      message: 'Usuario registrado con éxito',
    };
  }
}
