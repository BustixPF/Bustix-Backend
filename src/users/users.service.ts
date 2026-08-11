import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/roles.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

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

  async updateUserRole(id: string, role: Role) {
    const updatedUser = await this.usersRepository.updateUserRole(id, role);

    try {
      await this.notificationsService.sendRoleChangedEmail(updatedUser);
    } catch (error) {
      console.error(`Error al enviar notificación a ${updatedUser.email}:`, error);
    }

    return updatedUser;
  }

  updateUserActive(id: string, isActive: boolean) {
    return this.usersRepository.updateUserActive(id, isActive);
  }
}
