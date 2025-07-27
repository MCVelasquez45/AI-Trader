export interface AuthUser {
    name: string;
    email: string;
    avatar: string;
    bio: string;
    googleId?: string;
    role?: 'user' | 'admin';
    trades?: string[]; // trade IDs if linked
  }