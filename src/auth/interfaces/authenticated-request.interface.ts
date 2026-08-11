import { Request } from 'express';
import { Role } from '../../common/roles.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: Role;
  roles?: Role[];
  companyId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
