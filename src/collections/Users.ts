import type { CollectionConfig } from 'payload';

// Roles, invite-only access and 2FA arrive in Phase 2 (CP-2.1 and CP-2.2).
// Keep this minimal until then: it exists so the admin panel can create a user.
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [],
};
