import { describe, expect, it } from 'vitest';

import {
  applyBootstrapRole,
  hasAnyRole,
  hasRole,
  readPublic,
  readUsers,
  USER_ROLES,
  writeMedia,
} from './roles';

describe('role access helpers', () => {
  const superAdmin = { id: 1, roles: ['super-admin'] };
  const editor = { id: 2, roles: ['editor'] };

  it('defines the roles from the access model', () => {
    expect(USER_ROLES).toEqual(['super-admin', 'editor', 'product-manager', 'sales-support']);
  });

  it('checks one or more roles without trusting malformed user data', () => {
    expect(hasRole(superAdmin, 'super-admin')).toBe(true);
    expect(hasAnyRole(editor, ['editor', 'product-manager'])).toBe(true);
    expect(hasRole({ id: 3, roles: 'super-admin' }, 'super-admin')).toBe(false);
    expect(hasRole(null, 'super-admin')).toBe(false);
  });

  it('allows super admins to read all users and other staff only themselves', () => {
    expect(readUsers({ req: { user: superAdmin } } as never)).toBe(true);
    expect(readUsers({ req: { user: editor } } as never)).toEqual({ id: { equals: 2 } });
    expect(readUsers({ req: { user: null } } as never)).toBe(false);
  });

  it('forces an unauthenticated first-user registration to the super-admin role', () => {
    expect(
      applyBootstrapRole({
        data: { email: 'first@example.invalid', roles: ['editor'] },
        operation: 'create',
        hasAuthenticatedUser: false,
      }),
    ).toEqual({ email: 'first@example.invalid', roles: ['super-admin'] });
  });

  it('leaves authenticated role assignments and update operations unchanged', () => {
    const data = { roles: ['editor'] as const };

    expect(applyBootstrapRole({ data, operation: 'create', hasAuthenticatedUser: true })).toBe(
      data,
    );
    expect(applyBootstrapRole({ data, operation: 'update', hasAuthenticatedUser: false })).toBe(
      data,
    );
  });
});

describe('media access (docs/DATABASE.md §4)', () => {
  const superAdmin = { id: 1, roles: ['super-admin'] };
  const editor = { id: 2, roles: ['editor'] };
  const productManager = { id: 3, roles: ['product-manager'] };
  const salesSupport = { id: 4, roles: ['sales-support'] };

  it('lets super-admin, editor and product-manager write media', () => {
    expect(writeMedia({ req: { user: superAdmin } } as never)).toBe(true);
    expect(writeMedia({ req: { user: editor } } as never)).toBe(true);
    expect(writeMedia({ req: { user: productManager } } as never)).toBe(true);
  });

  it('denies media writes to sales-support and anonymous users', () => {
    expect(writeMedia({ req: { user: salesSupport } } as never)).toBe(false);
    expect(writeMedia({ req: { user: null } } as never)).toBe(false);
  });

  it('reads media publicly, with or without a session', () => {
    expect(readPublic({ req: { user: null } } as never)).toBe(true);
    expect(readPublic({ req: { user: salesSupport } } as never)).toBe(true);
  });
});
