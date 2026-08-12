import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../common/roles.enum';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      if (existingUser.isActive === false) {
        throw new BadRequestException(
          'El correo ingresado pertenece a una cuenta desactivada. Contacte con el soporte.',
        );
      }
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    return await this.usersRepository.addUser(createUserDto);
  }

  async findAll(page: number = 1, limit: number = 10) {
    return await this.usersRepository.getAllUsers(page, limit);
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    return await this.usersRepository.getUserById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    await this.findOne(id);
    return await this.usersRepository.updateUser(id, updateUserDto);
  }

  async updateUserRole(id: string, role: Role): Promise<Omit<User, 'password'>> {
    await this.findOne(id);
    return await this.usersRepository.updateUserRole(id, role);
  }

  async updateUserActive(id: string, isActive: boolean): Promise<Omit<User, 'password'>> {
    await this.findOne(id);
    return await this.usersRepository.updateActive(id, isActive);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.usersRepository.deleteUser(id);
    return { message: `Usuario con ID ${id} eliminado con éxito.` };
  }
}