import { Forbidden } from 'payload';

/**
 * Local-API context flag used by `pnpm seed:admin` to allow the one
 * unauthenticated create that bootstraps the first Super Admin. An HTTP caller
 * cannot set request context, so it cannot use this to register.
 */
export const FIRST_USER_BOOTSTRAP_CONTEXT = 'allowFirstUserBootstrap';

export function isFirstUserBootstrapAllowed(context: unknown): boolean {
  return (
    typeof context === 'object' &&
    context !== null &&
    (context as Record<string, unknown>)[FIRST_USER_BOOTSTRAP_CONTEXT] === true
  );
}

/**
 * Payload's `/api/users/first-register` endpoint calls `payload.create` with
 * `overrideAccess: true` (see `registerFirstUserOperation` in
 * `node_modules/payload/dist/auth/operations/registerFirstUser.js`), so
 * `access.create` alone cannot stop a stranger from registering the first
 * user. This guard runs in `beforeChange` and rejects every unauthenticated
 * create unless it comes from `pnpm seed:admin`.
 */
export function assertFirstUserRegistrationAllowed({
  operation,
  hasAuthenticatedUser,
  context,
}: {
  operation: 'create' | 'update';
  hasAuthenticatedUser: boolean;
  context: unknown;
}): void {
  if (operation !== 'create' || hasAuthenticatedUser) return;
  if (isFirstUserBootstrapAllowed(context)) return;

  throw new Forbidden();
}
