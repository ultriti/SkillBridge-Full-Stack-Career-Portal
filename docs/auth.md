# Authentication & Authorization Documentation

## Overview

SkillBridge Phase 3 implements a secure JWT-based authentication system with role-based access control (RBAC). The system uses two-token strategy: short-lived access tokens and longer-lived refresh tokens stored in HttpOnly cookies.

## Architecture

### Technology Stack

- **Password Hashing**: bcrypt (configurable salt rounds)
- **JWT**: jsonwebtoken
- **Cookie Management**: cookie-parser
- **Input Validation**: Zod
- **Database**: PostgreSQL

### Components

```
src/
├── middleware/
│   ├── auth.middleware.ts       # Authentication & authorization middleware
├── controllers/
│   └── auth.controller.ts       # Request handlers
├── services/
│   └── auth.service.ts          # Business logic
├── repositories/
│   ├── user.repository.ts       # User database queries
│   └── refresh-token.repository.ts  # Refresh token queries
├── validators/
│   └── auth.validator.ts        # Zod validation schemas
├── utils/
│   ├── jwt.ts                   # JWT token generation & verification
│   └── password.ts              # Password hashing & comparison
├── types/
│   ├── auth.types.ts            # Auth-related TypeScript interfaces
│   └── express.d.ts             # Express type augmentation
├── constants/
│   └── auth.constants.ts        # Auth constants & roles
└── routes/
    └── auth.routes.ts           # Authentication endpoints
```

## JWT Strategy

### Access Token

**Purpose**: Authenticate API requests  
**Expiry**: 15 minutes (configurable via `JWT_ACCESS_EXPIRES_IN`)  
**Secret**: `JWT_ACCESS_SECRET`  
**Storage**: JSON response body (memory-managed by frontend)

**Payload**:
```json
{
  "sub": "user-uuid",
  "role": "student|recruiter|admin",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token

**Purpose**: Obtain new access tokens without user re-authentication  
**Expiry**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)  
**Secret**: `JWT_REFRESH_SECRET` (different from access secret)  
**Storage**: HttpOnly cookie (`refreshToken`)  
**Database**: Hashed in `refresh_tokens` table for revocation tracking

**Payload**:
```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Security Architecture

### Password Security

- **Algorithm**: bcrypt with 10 salt rounds
- **Never stored in plaintext**
- **Never returned in API responses**
- **Hashed before database insertion**

### Token Security

- **Separate secrets** for access and refresh tokens
- **Refresh tokens** stored in `HttpOnly` cookies (inaccessible to JavaScript)
- **Token hashing** in database with SHA-256
- **Short-lived access tokens** reduce exposure window
- **No sensitive data** in JWT payloads

### Request Validation

- **Input validation** with Zod before business logic
- **Email format validation**
- **Password complexity requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Error Handling

- **Generic login errors**: "Invalid email or password" (no email enumeration)
- **Proper HTTP status codes**: 401, 403, 409
- **No sensitive information** in error responses

## Environment Variables

Required variables (must be set in `.env`):

```env
# Application
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillbridge
DB_USER=postgres
DB_PASSWORD=your_password_here

# Frontend
CLIENT_URL=http://localhost:5173

# JWT Secrets (CHANGE IN PRODUCTION)
JWT_ACCESS_SECRET=your-secret-key-here-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-here-change-in-production

# JWT Expiration
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookie Settings
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

**Important**: 
- Never commit `.env` file
- Change JWT secrets in production
- Set `COOKIE_SECURE=true` for HTTPS (production)
- Set `NODE_ENV=production` in production

## API Endpoints

### Public Endpoints

#### POST /api/auth/register

Register a new user.

**Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "student"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
}
```

**Error Responses**:
- `400`: Validation failed (invalid email, weak password, etc.)
- `409`: Email already exists

**Role Restrictions**: Only `student` and `recruiter` can be created via public registration. Admin creation must be done through seed/admin processes.

---

#### POST /api/auth/login

Authenticate user and issue tokens.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
}
```

**Cookie Set**: `refreshToken` (HttpOnly)

**Error Responses**:
- `400`: Validation failed
- `401`: Invalid email or password

---

#### POST /api/auth/refresh

Get a new access token using the refresh token.

**Request**: No body required (refresh token in cookie)

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Access token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:
- `401`: Refresh token missing or invalid

---

### Protected Endpoints

#### GET /api/auth/me

Get current authenticated user.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Responses**:
- `401`: Authentication required or token expired

---

#### POST /api/auth/logout

Logout user and revoke refresh token.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookie Cleared**: `refreshToken` removed

**Error Responses**:
- `401`: Authentication required

---

## Middleware Usage

### Authentication Middleware

Protect routes by requiring a valid access token:

```typescript
import { authenticate } from '../middleware/auth.middleware';

router.get('/protected', authenticate, controller);
```

### Authorization Middleware

Restrict routes to specific roles:

```typescript
import { authenticate, authorize } from '../middleware/auth.middleware';

// Admin only
router.get('/admin', authenticate, authorize('admin'), controller);

// Multiple roles
router.get('/recruiter-admin', authenticate, authorize('recruiter', 'admin'), controller);
```

## Role-Based Access Control

Three roles are supported:

| Role | Public Registration | Use Case |
|------|:-------------------:|----------|
| `student` | ✅ Yes | Job seekers, applicants |
| `recruiter` | ✅ Yes | Company recruiters, HR |
| `admin` | ❌ No | Platform administrators |

Admin users can only be created through:
1. Database seed scripts
2. Future admin management endpoints (Phase 4+)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'recruiter', 'admin')),
  phone VARCHAR(30),
  profile_image TEXT,
  bio TEXT,
  location VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Indexes:
- `user_id` - Fast lookups by user
- `token_hash` - Verify token validity
- `expires_at` - Cleanup expired tokens

## Testing Checklist

- [x] Student registration succeeds
- [x] Recruiter registration succeeds
- [x] Admin public registration fails
- [x] Duplicate email returns 409
- [x] Password hashing works (never stored plaintext)
- [x] Login with correct password succeeds
- [x] Login with incorrect password fails
- [x] Login doesn't reveal email existence
- [x] Access token authenticates requests
- [x] Invalid access token returns 401
- [x] Expired access token returns 401 with refresh hint
- [x] GET /api/auth/me requires authentication
- [x] GET /api/auth/me returns safe user data (no password_hash)
- [x] Refresh endpoint generates new access token
- [x] Missing refresh cookie returns 401
- [x] Invalid refresh token returns 401
- [x] Logout clears refresh cookie
- [x] Role authorization returns 403 for unauthorized users
- [x] TypeScript build succeeds (no type errors)
- [x] CORS allows frontend requests with credentials

## Security Verification

✅ **Password Security**:
- bcrypt hashing with 10 rounds
- Never stored in plaintext
- Never returned in responses

✅ **Token Security**:
- Separate JWT secrets
- HttpOnly refresh cookies
- Hashed token storage
- Proper expiration

✅ **SQL Injection Prevention**:
- Parameterized queries
- No string concatenation with user input

✅ **CORS & Cookies**:
- Proper credentials configuration
- Client URL validation
- Cookie path restrictions

✅ **Error Handling**:
- Generic login errors (no email enumeration)
- No sensitive information in responses
- Proper HTTP status codes

✅ **Input Validation**:
- Zod schema validation
- Email format validation
- Password complexity requirements

## Future Enhancements (Phase 4+)

- Password reset flow with email verification
- Multi-factor authentication (MFA)
- OAuth2/SSO integration
- Admin management endpoints
- Token blacklisting for immediate logout
- Rate limiting for authentication endpoints
- Audit logging for auth events
- Session management
