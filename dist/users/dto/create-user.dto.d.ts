import { Role } from '../../common/enums/role.enum';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    dni: number;
    phone: number;
    address?: string;
    role?: Role;
}
