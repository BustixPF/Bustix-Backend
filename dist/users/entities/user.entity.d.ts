import { Role } from '../../common/roles.enum';
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    dni: number;
    phone: number;
    address?: string;
    role: Role;
}
