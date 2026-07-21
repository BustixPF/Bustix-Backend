import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../common/roles.enum';
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

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.getUserByEmail(cleanEmail);


    if (!user) {
      throw new BadRequestException('Email o password incorrectos');
    }
    

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new BadRequestException('Email o password incorrectos');
    }


    const payload = {
      id: user.id,
      email: user.email,
      roles: user.role === Role.Admin ? [Role.Admin] : [Role.User],
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Logueado con éxito',
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

