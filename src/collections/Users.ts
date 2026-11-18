import type { CollectionConfig } from 'payload';

import {
  applyBootstrapRole,
  isSuperAdmin,
  readUsers,
  ROLE_LABELS,
  USER_ROLES,
} from '../access/roles';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  // No `access.admin`: it gates entry to the entire admin panel
  // (canAccessAdmin), so restricting it to super-admins would lock out
  // every other staff role. All roles sign in to the panel; per-collection
  // access below controls what each can do.
  access: {
    create: isSuperAdmin,
    read: readUsers,
    update: isSuperAdmin,
    delete: isSuperAdmin,
    unlock: isSuperAdmin,
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      // No defaultValue: every new account must be given roles explicitly.
      // The first-user registration flow is handled by the bootstrap hook.
      options: USER_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] })),
      saveToJWT: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) =>
        applyBootstrapRole({
          data,
          operation,
          hasAuthenticatedUser: Boolean(req.user),
        }),
    ],
  },
};
