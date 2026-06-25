export type UserRole = 'Admin' | 'HOD' | 'Faculty' | 'Student' | 'Parent';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  phone: string | null;
  status: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
