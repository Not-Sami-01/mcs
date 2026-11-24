import { createHmac } from 'node:crypto';
import type { Payload, PayloadRequest } from 'payload';

/**
 * Audit log writer (CP-2.3, docs/SECURITY.md C14, docs/DATABASE.md §2).
 *
 * Every call is best-effort: an audit failure must never break the operation
 * that triggered it. Entries carry no names, phone numbers, emails, tokens or
 * file contents. `ipHash` is a salted HMAC, never the raw address.
 */

export const AUDIT_ACTIONS = [
  'login',
  'login_failed',
  'user_created',
  'user_updated',
  'user_deleted',
  'publish',
  'unpublish',
  'delete',
  'totp_setup_started',
  'totp_enrolled',
  'totp_verified',
  'totp_failed',
  'totp_recovery_used',
  'totp_reenrolled',
  'totp_locked',
  'price_change',
  'export',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditEntry = {
  action: AuditAction;
  collectionSlug?: string;
  documentId?: string;
  actorId?: number | string;
  summary: string;
  ipHash?: string;
};

/** Hashes a visitor/actor IP with `IP_HASH_SALT`; undefined when either is absent. */
export function hashIp(headers: Headers | undefined, salt = process.env.IP_HASH_SALT) {
  if (!headers || !salt) return undefined;

  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim();
  if (!ip) return undefined;

  return createHmac('sha256', salt).update(ip).digest('hex');
}

export async function writeAuditLog({
  payload,
  req,
  actorId,
  ipHash,
  ...entry
}: AuditEntry & {
  payload: Payload;
  req?: PayloadRequest;
}): Promise<void> {
  // Postgres user ids are numbers; Normalise so a string id from a JWT does
  // not fail the relationship field.
  const numericActor = actorId === undefined ? undefined : Number(actorId);
  const actor =
    numericActor !== undefined && !Number.isNaN(numericActor) ? numericActor : undefined;

  try {
    await payload.create({
      collection: 'audit-logs',
      data: {
        ...entry,
        ...(actor !== undefined ? { actor } : {}),
        ...(ipHash ? { ipHash } : {}),
      },
      // Server-side bookkeeping: the collection refuses all HTTP writes, and
      // only this explicit bypass may create entries.
      overrideAccess: true,
      req,
    });
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Audit entry could not be written' });
  }
}

/** Payload for the plugin's callback, which has no `req`. Set once in `onInit`. */
let auditPayload: Payload | null = null;

export function registerAuditPayload(payload: Payload): void {
  auditPayload = payload;
}

type TotpAuditEvent = {
  action:
    | 'totp.setup.initiated'
    | 'totp.setup.completed'
    | 'totp.validate.success'
    | 'totp.validate.failed'
    | 'totp.validate.backup'
    | 'totp.disabled.self'
    | 'totp.disabled.by-admin'
    | 'totp.rate-limit.lockout';
  userId: string | number;
  adminId?: string | number;
  metadata?: Record<string, unknown>;
};

const TOTP_EVENTS: Record<TotpAuditEvent['action'], { action: AuditAction; summary: string }> = {
  'totp.setup.initiated': { action: 'totp_setup_started', summary: 'Two-factor setup started' },
  'totp.setup.completed': { action: 'totp_enrolled', summary: 'Two-factor enrolment completed' },
  'totp.validate.success': { action: 'totp_verified', summary: 'Two-factor code verified' },
  'totp.validate.failed': { action: 'totp_failed', summary: 'Two-factor code rejected' },
  'totp.validate.backup': { action: 'totp_recovery_used', summary: 'Recovery code used' },
  'totp.disabled.self': { action: 'totp_reenrolled', summary: 'Two-factor disabled by the user' },
  'totp.disabled.by-admin': {
    action: 'totp_reenrolled',
    summary: 'Two-factor reset by a Super Admin',
  },
  'totp.rate-limit.lockout': {
    action: 'totp_locked',
    summary: 'Two-factor verification locked out',
  },
};

export function mapTotpEvent(action: TotpAuditEvent['action']) {
  return TOTP_EVENTS[action];
}

/** `onAuditEvent` adapter for the TOTP plugin (ADR-008). */
export async function handleTotpAuditEvent(event: TotpAuditEvent): Promise<void> {
  if (!auditPayload) return;
  const mapped = TOTP_EVENTS[event.action];
  if (!mapped) return;

  await writeAuditLog({
    payload: auditPayload,
    action: mapped.action,
    collectionSlug: 'users',
    documentId: String(event.userId),
    actorId: event.adminId ?? event.userId,
    summary: mapped.summary,
  });
}
