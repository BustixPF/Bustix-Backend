import { BadRequestException, ConflictException } from "@nestjs/common";
import { Role } from "../common/roles.enum";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from "../users/dto/create-user.dto";

export class AuthService{
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersRepository: UsersRepository,) {}


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
      roles: user.isAdmin ? [Role.Admin] : [Role.User],
    };
    
    const token = this.jwtService.sign(payload);

    return {
      message: 'Logueado con éxito',
      token: token,
    };
  }

  async signUp(user: CreateUserDto) {
    user.email = user.email.trim().toLowerCase();

    const existUser = await this.usersRepository.getUserByEmail(user.email);
    if (existUser) {
      throw new ConflictException(409);
    }
    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    user.password = await bcrypt.hash(user.password, 10);
    const newUser = await this.usersRepository.addUser(user);
    const { password, confirmPassword, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      id: newUser,
    };
  }
}