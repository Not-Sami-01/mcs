import { randomBytes } from 'node:crypto';
import type { CollectionConfig } from 'payload';

import {
  applyBootstrapRole,
  hasRole,
  isSuperAdmin,
  readUsers,
  ROLE_LABELS,
  USER_ROLES,
} from '../access/roles';
import { assertFirstUserRegistrationAllowed } from '../access/first-user';
import {
  buildInviteUrl,
  INVITE_EXPIRATION_MS,
  INVITE_SUBJECT,
  inviteEmailHtml,
  sendStaffInvite,
  shouldSendInvite,
} from '../auth/invites';
import { reenrollTotpEndpoint } from '../auth/totp';
import { auditLogin, auditLoginError, auditUserChange, auditUserDelete } from '../audit/hooks';
import { getSiteEnvironment } from '../config/site-env';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Lock the account after five failed attempts (docs/SECURITY.md C1).
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    // Short staff session: two hours, then the token expires.
    tokenExpiration: 2 * 60 * 60,
    cookies: {
      // `Secure` would drop the cookie on http://localhost; enable it only
      // where the site is actually served over HTTPS.
      secure: getSiteEnvironment() === 'production',
      sameSite: 'Strict',
    },
    forgotPassword: {
      // The same one-time link backs both invites and "forgot password".
      expiration: INVITE_EXPIRATION_MS,
      minRequestInterval: 60 * 1000,
      generateEmailSubject: () => INVITE_SUBJECT,
      generateEmailHTML: (args) =>
        inviteEmailHtml({
          url: buildInviteUrl({
            serverURL: process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000',
            token: args?.token ?? '',
          }),
        }),
    },
  },
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
  endpoints: [reenrollTotpEndpoint],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Registration is invite-only: Payload's first-register endpoint
        // bypasses access control, so it is blocked here instead
        // (docs/SECURITY.md C1, `src/access/first-user.ts`).
        assertFirstUserRegistrationAllowed({
          operation,
          hasAuthenticatedUser: Boolean(req.user),
          context: req.context,
        });

        // Payload requires a password to create an auth user, but an invited
        // account must not have a password anybody knows. Replace whatever was
        // typed with a random secret: the invite link is the only way in.
        if (operation === 'create' && hasRole(req.user, 'super-admin')) {
          return {
            ...applyBootstrapRole({ data, operation, hasAuthenticatedUser: true }),
            password: randomBytes(32).toString('hex'),
          };
        }

        return applyBootstrapRole({
          data,
          operation,
          hasAuthenticatedUser: Boolean(req.user),
        });
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (
          !shouldSendInvite({
            operation,
            hasAuthenticatedUser: Boolean(req.user),
            context: req.context,
          })
        ) {
          return doc;
        }

        try {
          await sendStaffInvite({ payload: req.payload, email: doc.email, req });
        } catch (error) {
          // The account exists; the Super Admin can resend through
          // "forgot password". Never log the token or the address.
          req.payload.logger.error({
            err: error,
            msg: 'Staff invite email could not be sent',
          });
        }

        return doc;
      },
      // CP-2.3 audit trail (docs/SECURITY.md C14).
      auditUserChange,
    ],
    afterLogin: [auditLogin],
    afterError: [auditLoginError],
    afterDelete: [auditUserDelete],
  },
};
