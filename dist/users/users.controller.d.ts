import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    findAll(page?: string, limit?: string): Promise<Omit<import("./entities/user.entity").User, "password">[]>;
    findOne(id: string): Promise<Omit<import("./entities/user.entity").User, "password">>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
}
