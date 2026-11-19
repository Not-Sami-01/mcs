import type { Access } from 'payload';

export const USER_ROLES = ['super-admin', 'editor', 'product-manager', 'sales-support'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  'super-admin': 'Super Admin',
  editor: 'Editor',
  'product-manager': 'Product Manager',
  'sales-support': 'Sales and Support',
};

type RoleBearingUser = {
  id: number | string;
  roles?: unknown;
};

export function isRoleBearingUser(user: unknown): user is RoleBearingUser {
  return typeof user === 'object' && user !== null && 'id' in user;
}

export function hasRole(user: unknown, role: UserRole): boolean {
  return (
    isRoleBearingUser(user) &&
    Array.isArray(user.roles) &&
    user.roles.some((assignedRole) => assignedRole === role)
  );
}

export function hasAnyRole(user: unknown, roles: readonly UserRole[]): boolean {
  return roles.some((role) => hasRole(user, role));
}

/** Roles that may create, update and delete media (docs/DATABASE.md §4). */
const MEDIA_WRITERS = ['super-admin', 'editor', 'product-manager'] as const;

export const writeMedia: Access = ({ req }) => hasAnyRole(req.user, MEDIA_WRITERS);

/** Public read: published/site assets anyone may fetch without login. */
export const readPublic: Access = () => true;

export const isSuperAdmin: Access = ({ req }) => hasRole(req.user, 'super-admin');

export const readUsers: Access = ({ req }) => {
  if (hasRole(req.user, 'super-admin')) return true;
  if (!isRoleBearingUser(req.user)) return false;

  return { id: { equals: req.user.id } };
};

export function applyBootstrapRole<T extends Record<string, unknown>>({
  data,
  operation,
  hasAuthenticatedUser,
}: {
  data: T;
  operation: 'create' | 'update';
  hasAuthenticatedUser: boolean;
}): T & { roles?: UserRole[] } {
  if (operation === 'create' && !hasAuthenticatedUser) {
    return { ...data, roles: ['super-admin'] };
  }

  return data;
}
