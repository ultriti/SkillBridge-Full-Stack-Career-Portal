export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'recruiter';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  data: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}
