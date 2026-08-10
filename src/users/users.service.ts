import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    return this.usersRepository.addUser({
      ...createUserDto,
      email: createUserDto.email.trim().toLowerCase(),
      password: await bcrypt.hash(createUserDto.password, 10),
    });
  }

  findAll(page: number, limit: number) {
    return this.usersRepository.getAllUsers(page, limit);
  }

  findOne(id: string) {
    return this.usersRepository.getUserById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.updateUser(id, updateUserDto);
  }

  remove(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}
