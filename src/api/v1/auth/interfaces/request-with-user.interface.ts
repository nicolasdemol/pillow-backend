// 📂 src/auth/interfaces/request-with-user.interface.ts
import { Request } from 'express';
import { Role } from '../enums/role.enum';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    roles: Role[];
  };
}
