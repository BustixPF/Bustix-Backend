import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersRepository {
    private readonly usersOrmRepository;
    constructor(usersOrmRepository: Repository<User>);
    getAllUsers(page: number, limit: number): Promise<Omit<User, 'password'>[]>;
    getUserById(id: string): Promise<Omit<User, 'password'>>;
    getUserByEmail(email: string): Promise<User | null>;
    addUser(newUserData: CreateUserDto): Promise<Omit<User, 'password'>>;
    updateUser(id: string, newUserData: UpdateUserDto): Promise<Omit<User, 'password'>>;
    deleteUser(id: string): Promise<string>;
}
