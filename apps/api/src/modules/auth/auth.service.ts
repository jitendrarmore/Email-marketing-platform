import { SignJWT, jwtVerify } from 'jose';
import * as argon2 from 'argon2';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthTokens, 
  Role,
  Permission,
  ROLE_PERMISSIONS
} from '@email-platform/shared';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { logger } from '../../infrastructure/logging/logger';
import { 
  ConflictException, 
  UnauthorizedException, 
  NotFoundException 
} from '../../common/exceptions/http-exceptions';

/**
 * Service for handling authentication operations.
 */
export class AuthService {
  /**
   * Register a new user and return auth tokens.
   */
  async register(data: RegisterRequest): Promise<AuthTokens> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(data.password);

    // Create organization if organizationName is provided, else error or use default
    // Assuming organization logic is handled by Prisma transaction
    const orgResult = await prisma.$transaction(async (tx) => {
      let organization;
      if (data.organizationName) {
        organization = await tx.organization.create({
          data: {
            name: data.organizationName,
            slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          }
        });
      } else {
        // Find a default or handle as required, here we assume organizationName is mandatory for registration
        // or we just fail if we don't have one
        throw new ConflictException('Organization name is required');
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          orgId: organization.id,
        },
      });

      let role = await tx.role.findFirst({ where: { name: 'USER' } });
      if (!role) {
        role = await tx.role.create({ data: { name: 'USER' } });
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return { user, organization };
    });

    // Fetch user with roles for token generation
    const userWithRoles = await prisma.user.findUnique({
      where: { id: orgResult.user.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    const permissions = this.buildPermissions(userWithRoles);
    return this.generateTokens(userWithRoles, permissions);
  }

  /**
   * Login a user and return auth tokens.
   */
  async login(data: LoginRequest): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const permissions = this.buildPermissions(user);
    const tokens = await this.generateTokens(user, permissions);

    logger.info({ userId: user.id }, 'User logged in successfully');
    
    // Log audit event (assumes AuditLog model exists)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        orgId: user.orgId,
        action: 'USER_LOGIN',
        resourceId: user.id,
        resourceType: 'USER',
        ipAddress: '', // To be filled from request context ideally
        userAgent: '',
      }
    });

    return tokens;
  }

  /**
   * Refresh auth tokens using a valid refresh token.
   */
  async refreshToken(refreshTokenStr: string): Promise<AuthTokens> {
    let payload;
    try {
      const secret = new TextEncoder().encode(config.JWT_REFRESH_SECRET);
      const { payload: jwtPayload } = await jwtVerify(refreshTokenStr, secret);
      payload = jwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshTokenStr);
    
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (tokenRecord.isRevoked) {
      // Token reuse detected - revoke entire family
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { isRevoked: true }
      });
      logger.warn({ familyId: tokenRecord.familyId }, 'Refresh token reuse detected. Family revoked.');
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke current token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true }
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = this.buildPermissions(user);
    return this.generateTokens(user, permissions, tokenRecord.familyId);
  }

  /**
   * Logout a user by revoking their refresh token family.
   */
  async logout(userId: string, refreshTokenStr: string): Promise<void> {
    const tokenHash = this.hashToken(refreshTokenStr);
    
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (tokenRecord) {
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { isRevoked: true }
      });
    }

    logger.info({ userId }, 'User logged out successfully');
  }

  /**
   * Build permissions array from user roles.
   */
  private buildPermissions(userWithRoles: any): string[] {
    const permissions = new Set<string>();
    
    for (const userRole of userWithRoles.userRoles) {
      const roleName = userRole.role.name as Role;
      const rolePerms = ROLE_PERMISSIONS[roleName] || [];
      
      for (const perm of rolePerms) {
        if (perm === '*:*') {
          return ['*:*'];
        }
        permissions.add(perm);
      }
    }
    
    return Array.from(permissions);
  }

  /**
   * Generate access and refresh tokens.
   */
  private async generateTokens(user: any, permissions: string[], existingFamilyId?: string): Promise<AuthTokens> {
    const secret = new TextEncoder().encode(config.JWT_SECRET);
    const refreshSecret = new TextEncoder().encode(config.JWT_REFRESH_SECRET);
    const familyId = existingFamilyId || uuidv4();
    const tokenId = uuidv4();

    const roles = user.userRoles.map((r: any) => r.role.name);

    const accessToken = await new SignJWT({ 
      email: user.email, 
      orgId: user.orgId, 
      roles, 
      permissions 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(config.JWT_EXPIRES_IN)
      .sign(secret);

    const refreshToken = await new SignJWT({ 
      familyId, 
      tokenId 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(config.JWT_REFRESH_EXPIRES_IN)
      .sign(refreshSecret);

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.parseDuration(config.JWT_REFRESH_EXPIRES_IN));

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        familyId,
        expiresAt,
      }
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseDuration(config.JWT_EXPIRES_IN) / 1000 // in seconds
    };
  }

  /**
   * Helper to hash refresh tokens.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Helper to parse expiration string to milliseconds.
   */
  private parseDuration(duration: string): number {
    // Basic parser for things like '15m', '7d'
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 3600000; // default 1 hour
    const val = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return val * 1000;
      case 'm': return val * 60 * 1000;
      case 'h': return val * 60 * 60 * 1000;
      case 'd': return val * 24 * 60 * 60 * 1000;
      default: return 3600000;
    }
  }
}

export const authService = new AuthService();
