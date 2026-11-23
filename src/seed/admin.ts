import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { getPayload } from 'payload';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';
import { sendStaffInvite } from '../auth/invites';
import { getSiteEnvironment } from '../config/site-env';
import config from '../payload.config';

/**
 * `pnpm seed:admin` — creates the first Super Admin without leaving a public
 * registration window open (`docs/DATABASE.md` §6). The account is created
 * without a password; the invite link is the only way in.
 *
 * Email comes from `SEED_ADMIN_EMAIL`, or is asked for on a TTY.
 */
export async function resolveAdminEmail({
  email,
  env = process.env.SEED_ADMIN_EMAIL,
  interactive = Boolean(process.stdin.isTTY),
}: {
  email?: string;
  env?: string;
  interactive?: boolean;
} = {}): Promise<string> {
  const provided = (email ?? env ?? '').trim().toLowerCase();

  if (provided) return assertEmail(provided);

  if (!interactive) {
    throw new Error(
      'Provide the Super Admin email: set SEED_ADMIN_EMAIL=<address> or run this command in a terminal.',
    );
  }

  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await readline.question('Super Admin email: ');
    return assertEmail(answer.trim().toLowerCase());
  } finally {
    readline.close();
  }
}

function assertEmail(value: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('That does not look like an email address.');
  }

  return value;
}

export async function seedAdmin({ email }: { email?: string } = {}): Promise<void> {
  const address = await resolveAdminEmail({ email });

  if (
    getSiteEnvironment() === 'production' &&
    (process.env.EMAIL_PROVIDER ?? 'console') === 'console'
  ) {
    throw new Error(
      'Refusing to create the production Super Admin with EMAIL_PROVIDER=console: the invite link would only reach the logs. Configure the email provider first (Q10).',
    );
  }

  const payload = await getPayload({ config });

  try {
    const existingSuperAdmins = await payload.count({
      collection: 'users',
      where: { roles: { equals: 'super-admin' } },
      overrideAccess: true,
    });

    if (existingSuperAdmins.totalDocs > 0) {
      throw new Error('A Super Admin already exists; refusing to create another one.');
    }

    const existingAccount = await payload.find({
      collection: 'users',
      where: { email: { equals: address } },
      limit: 1,
      overrideAccess: true,
    });

    if (existingAccount.docs.length > 0) {
      throw new Error(
        'A user with that email already exists. Promote it in the admin panel instead of re-creating it.',
      );
    }

    await payload.create({
      collection: 'users',
      // Payload requires a password on create; nobody ever learns this one.
      // The invite link below is the only way in.
      data: { email: address, roles: ['super-admin'], password: randomBytes(32).toString('hex') },
      overrideAccess: true,
      // The only unauthenticated create the Users hook allows.
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    const invite = await sendStaffInvite({ payload, email: address });

    if (!invite) {
      throw new Error('The account was created but no invite token was generated.');
    }

    console.info(
      `Super Admin created for ${address}. Invite sent (single use, expires in 24 hours).`,
    );
  } finally {
    await payload.destroy();
  }
}

/**
 * Payload's bin runner logs a rejected script but still exits 0, so the
 * failure must set `process.exitCode` itself (same pattern as `src/seed/index.ts`).
 */
export const adminScript = async (): Promise<void> => {
  try {
    await seedAdmin();
  } catch (error) {
    process.exitCode = 1;
    throw error;
  }
};
