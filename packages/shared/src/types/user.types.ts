export interface UserResponse { id: string; email: string; firstName: string; lastName: string; status: string; roles: string[]; createdAt: string; lastLogin?: string; }
export interface CreateUserRequest { email: string; password: string; firstName: string; lastName: string; roles: string[]; }
export interface UpdateUserRequest { firstName?: string; lastName?: string; status?: string; roles?: string[]; }
export interface UserSenderAccessResponse { id: string; userId: string; senderIdentityId: string; senderEmail: string; senderDisplayName: string; grantedAt: string; grantedBy: string; }
