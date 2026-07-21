import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersOrmRepository: Repository<User>,
  ) {}

  async getAllUsers(
    page: number,
    limit: number,
  ): Promise<Omit<User, 'password'>[]> {
    const skip = (page - 1) * limit;
    const users = await this.usersOrmRepository.find({ skip, take: limit });
    return users.map(({ password, ...userNoPassword }) => {
      void password;
      return userNoPassword;
    });
  }

  async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const foundUser = await this.usersOrmRepository.findOneBy({ id });
    if (!foundUser) {
      throw new NotFoundException(`No se encontró el usuario con id ${id}`);
    }
    const { password, ...userNoPassword } = foundUser;
    void password;
    return userNoPassword;
  }

  /** Devuelve el user completo (con password) — lo va a usar el módulo de auth más adelante */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersOrmRepository.findOneBy({ email });
  }

  async addUser(newUserData: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.usersOrmRepository.findOneBy({
      email: newUserData.email,
    });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const { confirmPassword, ...userData } = newUserData;
    void confirmPassword;

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.usersOrmRepository.create({
      ...userData,
      password: hashedPassword,
    });
    const savedUser = await this.usersOrmRepository.save(user);
    const { password, ...userNoPassword } = savedUser;
    void password;
    return userNoPassword;
  }

  async updateUser(
    id: string,
    newUserData: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersOrmRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`No existe usuario con id ${id}`);
    }

    if (newUserData.password) {
      newUserData.password = await bcrypt.hash(newUserData.password, 10);
    }

    const mergedUser = this.usersOrmRepository.merge(user, newUserData);
    const savedUser = await this.usersOrmRepository.save(mergedUser);
    const { password, ...userNoPassword } = savedUser;
    void password;
    return userNoPassword;
  }
}
