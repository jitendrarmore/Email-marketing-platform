export const Permission = {
  // Users
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  // Providers
  PROVIDERS_READ: 'providers:read',
  PROVIDERS_CREATE: 'providers:create',
  PROVIDERS_UPDATE: 'providers:update',
  PROVIDERS_DELETE: 'providers:delete',
  // Senders
  SENDERS_READ: 'senders:read',
  SENDERS_CREATE: 'senders:create',
  SENDERS_UPDATE: 'senders:update',
  SENDERS_DELETE: 'senders:delete',
  SENDERS_VERIFY: 'senders:verify',
  // Campaigns
  CAMPAIGNS_READ: 'campaigns:read',
  CAMPAIGNS_CREATE: 'campaigns:create',
  CAMPAIGNS_UPDATE: 'campaigns:update',
  CAMPAIGNS_DELETE: 'campaigns:delete',
  CAMPAIGNS_SUBMIT: 'campaigns:submit',
  // Audit
  AUDIT_READ: 'audit:read',
  // Queues
  QUEUES_MANAGE: 'queues:manage',
  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  // Wildcard
  ALL: '*:*',
} as const;

export type PermissionValue = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<string, PermissionValue[]> = {
  ADMIN: [Permission.ALL],
  MAINTAINER: [
    Permission.PROVIDERS_READ, Permission.PROVIDERS_UPDATE,
    Permission.SENDERS_READ, Permission.SENDERS_CREATE, Permission.SENDERS_UPDATE, Permission.SENDERS_DELETE, Permission.SENDERS_VERIFY,
    Permission.CAMPAIGNS_READ,
    Permission.USERS_READ,
    Permission.QUEUES_MANAGE,
    Permission.AUDIT_READ,
    Permission.SETTINGS_READ,
  ],
  USER: [
    Permission.CAMPAIGNS_READ, Permission.CAMPAIGNS_CREATE, Permission.CAMPAIGNS_UPDATE, Permission.CAMPAIGNS_DELETE, Permission.CAMPAIGNS_SUBMIT,
    Permission.SENDERS_READ,
  ],
};
