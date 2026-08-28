import { 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserSenderAccessResponse,
  UserStatus
} from '@email-platform/shared';
import * as argon2 from 'argon2';
import { prisma } from '../../config/database.js';
import { logger } from '../../infrastructure/logging/logger.js';
import { NotFoundException, ConflictException } from '../../common/exceptions/http-exceptions.js';

/**
 * Service for handling user-related operations.
 */
export class UsersService {
  /**
   * List users in an organization.
   */
  async listUsers(orgId: string, pagination: { page: number; limit: number }, filters?: any): Promise<any> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { orgId, deletedAt: null };
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            include: { role: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      data: users.map(this.mapToUserResponse),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user by ID.
   */
  async getUserById(orgId: string, userId: string): Promise<UserResponse> {
    const user = await prisma.user.findFirst({
      where: { id: userId, orgId, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true }
        },
        userSenderAccess: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToUserResponse(user);
  }

  /**
   * Create a new user.
   */
  async createUser(orgId: string, data: CreateUserRequest, createdBy: string): Promise<UserResponse> {
    const existing = await prisma.user.findFirst({
      where: { email: data.email }
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          orgId,
          status: 'ACTIVE'
        }
      });

      if (data.roles && data.roles.length > 0) {
        const roles = await tx.role.findMany({
          where: { name: { in: data.roles } }
        });

        await tx.userRole.createMany({
          data: roles.map(role => ({
            userId: newUser.id,
            roleId: role.id
          }))
        });
      }

      await tx.auditLog.create({
        data: {
          userId: createdBy,
          orgId,
          action: 'USER_CREATE',
          resourceId: newUser.id,
          resourceType: 'USER',
        }
      });

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: { userRoles: { include: { role: true } } }
      });
    });

    return this.mapToUserResponse(user);
  }

  /**
   * Update a user.
   */
  async updateUser(orgId: string, userId: string, data: UpdateUserRequest, updatedBy: string): Promise<UserResponse> {
    const existing = await prisma.user.findFirst({
      where: { id: userId, orgId, deletedAt: null }
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          status: data.status as UserStatus,
        }
      });

      if (data.roles) {
        await tx.userRole.deleteMany({
          where: { userId }
        });

        const roles = await tx.role.findMany({
          where: { name: { in: data.roles } }
        });

        if (roles.length > 0) {
          await tx.userRole.createMany({
            data: roles.map(role => ({
              userId,
              roleId: role.id
            }))
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: updatedBy,
          orgId,
          action: 'USER_UPDATE',
          resourceId: userId,
          resourceType: 'USER',
        }
      });

      return tx.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } }
      });
    });

    return this.mapToUserResponse(user);
  }

  /**
   * Delete a user (soft delete).
   */
  async deleteUser(orgId: string, userId: string, deletedBy: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { id: userId, orgId, deletedAt: null }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), status: 'INACTIVE' }
      });

      await tx.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true }
      });

      await tx.auditLog.create({
        data: {
          userId: deletedBy,
          orgId,
          action: 'USER_DELETE',
          resourceId: userId,
          resourceType: 'USER',
        }
      });
    });

    logger.info({ userId, deletedBy }, 'User deleted successfully');
  }

  /**
   * Grant sender access.
   */
  async grantSenderAccess(orgId: string, userId: string, senderIdentityId: string, grantedBy: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { id: userId, orgId, deletedAt: null }
    });
    if (!user) throw new NotFoundException('User not found');

    const sender = await prisma.senderIdentity.findFirst({
      where: { id: senderIdentityId, orgId }
    });
    if (!sender) throw new NotFoundException('Sender Identity not found');

    const existing = await prisma.userSenderAccess.findFirst({
      where: { userId, senderIdentityId }
    });

    await prisma.$transaction(async (tx) => {
      if (existing) {
        if (!existing.isActive) {
          await tx.userSenderAccess.update({
            where: { id: existing.id },
            data: { isActive: true }
          });
        }
      } else {
        await tx.userSenderAccess.create({
          data: { userId, senderIdentityId, isActive: true, grantedBy }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: grantedBy,
          orgId,
          action: 'USER_GRANT_SENDER_ACCESS',
          resourceId: userId,
          resourceType: 'USER',
        }
      });
    });
  }

  /**
   * Revoke sender access.
   */
  async revokeSenderAccess(orgId: string, userId: string, senderIdentityId: string, revokedBy: string): Promise<void> {
    const existing = await prisma.userSenderAccess.findFirst({
      where: { userId, senderIdentityId }
    });

    if (!existing) {
      throw new NotFoundException('Sender Access not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.userSenderAccess.update({
        where: { id: existing.id },
        data: { isActive: false }
      });

      await tx.auditLog.create({
        data: {
          userId: revokedBy,
          orgId,
          action: 'USER_REVOKE_SENDER_ACCESS',
          resourceId: userId,
          resourceType: 'USER',
        }
      });
    });
  }

  /**
   * Get user sender access.
   */
  async getUserSenderAccess(orgId: string, userId: string): Promise<UserSenderAccessResponse[]> {
    const user = await prisma.user.findFirst({
      where: { id: userId, orgId, deletedAt: null }
    });
    if (!user) throw new NotFoundException('User not found');

    const access = await prisma.userSenderAccess.findMany({
      where: { userId, isActive: true },
      include: { senderIdentity: true }
    });

    return access.map(a => ({
      id: a.id,
      userId: a.userId,
      senderIdentityId: a.senderIdentityId,
      senderEmail: a.senderIdentity.emailAddress,
      senderDisplayName: a.senderIdentity.displayName || '',
      grantedAt: a.grantedAt.toISOString(),
      grantedBy: a.grantedBy || '',
    }));
  }

  private mapToUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles: user.userRoles?.map((r: any) => r.role.name) || [],
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const usersService = new UsersService();
