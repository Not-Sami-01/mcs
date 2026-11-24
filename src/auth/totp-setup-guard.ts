import { Forbidden, type CollectionConfig, type Config } from 'payload';

type BeforeOperationHook = NonNullable<
  NonNullable<CollectionConfig['hooks']>['beforeOperation']
>[number];

/**
 * CP-2.2 exit criterion: staff must enrol before they can use the admin or the
 * data API. The plugin gates *enrolled* sessions (its verified cookie) and the
 * admin UI redirects unenrolled users to setup, but its REST/GraphQL hook
 * allows users with `totp.enabled: false` — otherwise setup could never happen.
 *
 * This hook closes that window for every collection. Auth handshake operations
 * (login, refresh, password reset, `me`) stay open so an account can sign in
 * and reach the setup screen. Trusted Local API calls with `overrideAccess:
 * true` (seeds, our own onboarding) bypass it, as Payload intends.
 */
const AUTH_HANDSHAKE_OPERATIONS = new Set([
  'login',
  'refresh',
  'forgotPassword',
  'resetPassword',
  'me',
]);

const blockUntilEnrolled: BeforeOperationHook = ({ operation, overrideAccess, req }) => {
  if (overrideAccess) return;

  const user = req.user as { totp?: { enabled?: boolean | null }; roles?: unknown } | null;
  if (!user || !Array.isArray(user.roles)) return; // public request
  if (user.totp?.enabled === true) return;
  if (AUTH_HANDSHAKE_OPERATIONS.has(operation)) return;

  throw new Forbidden(req.t);
};

export function enforceTotpSetup(config: Config): Config {
  return {
    ...config,
    collections: (config.collections ?? []).map((collection) => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        beforeOperation: [...(collection.hooks?.beforeOperation ?? []), blockUntilEnrolled],
      },
    })),
  };
}
