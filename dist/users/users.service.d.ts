import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    create(createUserDto: CreateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    findAll(page: number, limit: number): Promise<Omit<import("./entities/user.entity").User, "password">[]>;
    findOne(id: string): Promise<Omit<import("./entities/user.entity").User, "password">>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    remove(id: string): Promise<string>;
}
