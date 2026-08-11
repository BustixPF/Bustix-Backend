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

  async getCustomersByCompany(
    companyId: string,
  ): Promise<Omit<User, 'password'>[]> {
    return this.usersOrmRepository
      .createQueryBuilder('user')
      .innerJoin('user.tickets', 'ticket')
      .innerJoin('ticket.company', 'company')
      .where('company.id = :companyId', { companyId })
      .distinct(true)
      .orderBy('user.name', 'ASC')
      .getMany();
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

  async getUserByEmail(email: string): Promise<User | null> {
    return this.findByEmail(email);
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

    const user = this.usersOrmRepository.create(userData);
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

    if (newUserData.email && newUserData.email !== user.email) {
      const existingEmail = await this.usersOrmRepository.findOneBy({
        email: newUserData.email,
      });
      if (existingEmail) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
    }

    if (newUserData.dni && newUserData.dni !== user.dni) {
      const existingDni = await this.usersOrmRepository.findOneBy({
        dni: newUserData.dni,
      });
      if (existingDni) {
        throw new ConflictException('Ya existe un usuario con ese DNI');
      }
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

  async findByEmail(email: string) {
    return this.usersOrmRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async createGoogleUser(userData: {
    email: string;
    name: string;
    profilePicture?: string;
  }) {
    const newUser = this.usersOrmRepository.create({
      email: userData.email,
      name: userData.name,
    });

    return await this.usersOrmRepository.save(newUser);
  }

  async deleteUser(id: string): Promise<Omit<User, 'password'>> {
    const foundUser = await this.usersOrmRepository.findOneBy({ id });
    if (!foundUser) {
      throw new NotFoundException(`No existe usuario con id ${id}`);
    }

    await this.usersOrmRepository.remove(foundUser);

    const { password, ...userNoPassword } = foundUser;
    void password;
    return userNoPassword;
  }
}
