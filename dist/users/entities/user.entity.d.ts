import { Role } from '../../common/enums/role.enum';
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
