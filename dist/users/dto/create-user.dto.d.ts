import { Role } from '../../common/roles.enum';
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
