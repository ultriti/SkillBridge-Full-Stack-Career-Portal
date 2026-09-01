export const PUBLIC_ROLES = ['student', 'recruiter'] as const;
export const ADMIN_ROLE = 'admin';
export const ALL_ROLES = ['student', 'recruiter', 'admin'] as const;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 255;

export const COOKIE_NAME = 'refreshToken';
export const REFRESH_TOKEN_HEADER = 'Authorization';
