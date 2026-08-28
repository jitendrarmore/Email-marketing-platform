export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; firstName: string; lastName: string; organizationName?: string; }
export interface AuthTokens { accessToken: string; refreshToken: string; expiresIn: number; }
export interface JWTPayload { sub: string; email: string; orgId: string; roles: string[]; permissions: string[]; iat: number; exp: number; }
export interface RefreshTokenPayload { sub: string; familyId: string; tokenId: string; }
