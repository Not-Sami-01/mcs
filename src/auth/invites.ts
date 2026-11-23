import type { Payload } from 'payload';

import { isFirstUserBootstrapAllowed } from '../access/first-user';
import { getSiteEnvironment } from '../config/site-env';

/**
 * One-time staff invite lifetime. Kept here so the email text, the Payload
 * `forgotPassword.expiration` option and the tests agree.
 */
export const INVITE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

export const INVITE_SUBJECT = 'Set your MCS staff password';

export function buildInviteUrl({
  serverURL,
  token,
  adminRoute = '/admin',
}: {
  serverURL: string;
  token: string;
  adminRoute?: string;
}): string {
  const base = serverURL.replace(/\/+$/, '');
  const admin = adminRoute.startsWith('/') ? adminRoute : `/${adminRoute}`;

  return `${base}${admin}/reset/${encodeURIComponent(token)}`;
}

export function inviteEmailHtml({ url }: { url: string }): string {
  // Text only, no user-supplied values: nothing here can inject markup.
  return [
    '<p>You have been invited to the Malaysian Care System website admin panel.</p>',
    `<p><a href="${url}">Set your password</a></p>`,
    `<p>This link can be used once and expires in ${INVITE_EXPIRATION_MS / (60 * 60 * 1000)} hours.</p>`,
    '<p>If you did not expect this invitation, ignore this email and tell the person who invited you.</p>',
  ].join('\n');
}

/**
 * Invites are sent only when a Super Admin creates an account in the admin
 * panel. `seed:admin` creates the first account with the bootstrap flag and
 * prints its own link, so this hook stays out of the way there.
 */
export function shouldSendInvite({
  operation,
  hasAuthenticatedUser,
  context,
}: {
  operation: 'create' | 'update';
  hasAuthenticatedUser: boolean;
  context: unknown;
}): boolean {
  return operation === 'create' && hasAuthenticatedUser && !isFirstUserBootstrapAllowed(context);
}

export function getServerURL(fallback = 'http://localhost:3000'): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  return (configured || fallback).replace(/\/+$/, '');
}

/**
 * Generates a one-time reset token through Payload (`forgotPassword` writes
 * `resetPasswordToken` + `resetPasswordExpiration`), then sends our own invite
 * email. Payload's console adapter only logs the subject, so non-production
 * runs also log the link — the only way to finish an invite without an email
 * provider configured (Q10).
 */
export async function sendStaffInvite({
  payload,
  email,
  req,
}: {
  payload: Payload;
  email: string;
  req?: Parameters<Payload['forgotPassword']>[0]['req'];
}): Promise<{ url: string } | null> {
  const token = await payload.forgotPassword({
    collection: 'users',
    data: { email },
    disableEmail: true,
    req,
  });

  if (!token) return null;

  const url = buildInviteUrl({ serverURL: getServerURL(), token });

  await payload.sendEmail({
    to: email,
    subject: INVITE_SUBJECT,
    html: inviteEmailHtml({ url }),
  });

  const provider = process.env.EMAIL_PROVIDER?.trim() || 'console';
  if (provider === 'console' && getSiteEnvironment() !== 'production') {
    payload.logger.info(`Staff invite link (EMAIL_PROVIDER=console, dev only): ${url}`);
  }

  return { url };
}
