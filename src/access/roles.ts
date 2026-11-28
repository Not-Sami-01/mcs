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

/** Super Admin + Editor may write content (docs/DATABASE.md §4: categories/pages CRUD). */
export const writeContent: Access = ({ req }) => hasAnyRole(req.user, ['super-admin', 'editor']);

/**
 * Products are owned by Super Admin and Product Manager (docs/DATABASE.md §4).
 * Editors may read them but not change prices or stock.
 */
export const writeProducts: Access = ({ req }) =>
  hasAnyRole(req.user, ['super-admin', 'product-manager']);

/** Price history is visible to Super Admin and Product Manager only. */
export const readPriceHistory: Access = ({ req }) =>
  hasAnyRole(req.user, ['super-admin', 'product-manager']);

/** Super Admin + Editor may update navigation; no other staff role may. */
export const writeNavigation: Access = ({ req }) => hasAnyRole(req.user, ['super-admin', 'editor']);

/** Site-settings document update; field access narrows Editors to contact data. */
export const writeSiteSettings: Access = ({ req }) =>
  hasAnyRole(req.user, ['super-admin', 'editor']);

/**
 * Leads are worked by Super Admin and Sales and Support only (docs/DATABASE.md
 * §4). Reading and creating are the same pair; deleting is Super Admin only.
 */
export const readLeads: Access = ({ req }) =>
  hasAnyRole(req.user, ['super-admin', 'sales-support']);

export const createLeads: Access = readLeads;

export const updateLeads: Access = readLeads;

export const deleteLeads: Access = ({ req }) => hasRole(req.user, 'super-admin');

/** Super Admin-only operational fields (recipients, retention and chat setup). */
export const writeSensitiveSiteSettings: Access = ({ req }) => hasRole(req.user, 'super-admin');

export function canEditContactSettings(user: unknown): boolean {
  return hasAnyRole(user, ['super-admin', 'editor']);
}

export function canEditNavigation(user: unknown): boolean {
  return hasAnyRole(user, ['super-admin', 'editor']);
}

export function canEditSensitiveSiteSettings(user: unknown): boolean {
  return hasRole(user, 'super-admin');
}

/**
 * Public reads verified reviews only (docs/DATABASE.md §2: "Only verified
 * reviews can render"); any signed-in staff role reads everything, so an
 * Editor can verify a review before it appears.
 */
export const readVerifiedReviews: Access = ({ req }) => {
  if (req.user) return true;
  return { verified: { equals: true } };
};

/**
 * Public reads published pages only; any signed-in staff role reads everything
 * (matrix R for Product Manager and Sales and Support). `categories` have no
 * drafts — they use `readPublic` and rely on trash filtering.
 */
export const readPublished: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: 'published' } };
};

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
