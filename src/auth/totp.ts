import { addDataAndFileToRequest, type Endpoint } from 'payload';

import { hasRole } from '../access/roles';
import { hashIp, writeAuditLog } from '../audit/log';

/**
 * CP-2.2: reset another staff member's two-factor enrolment.
 *
 * The plugin's own admin-disable endpoint recognises a role literally named
 * `admin`; our roles are `super-admin`, so a Super Admin resets through this
 * endpoint instead. It requires:
 *
 * 1. a Super Admin session, and
 * 2. a second factor already verified for this session — proven by running a
 *    Local API read with `overrideAccess: false`, which the plugin's
 *    `beforeOperation` hook blocks (403) unless the verified cookie matches the
 *    session.
 *
 * Clearing `totp` removes the target's second factor; they can enrol again at
 * `/admin/setup-totp` (enrolment is optional since 2026-11-24). The secret and
 * recovery-code hashes never leave the database.
 */
export const reenrollTotpEndpoint: Endpoint = {
  path: '/totp/reenroll',
  method: 'post',
  handler: async (req) => {
    const { payload } = req;

    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasRole(user, 'super-admin')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fails closed for enrolled Super Admins: the plugin's data-API hook throws
    // Forbidden when a TOTP-enabled session has not completed its second factor.
    // A Super Admin who has not opted in has no factor to verify.
    try {
      await payload.find({
        collection: 'users',
        limit: 1,
        overrideAccess: false,
        user,
        req,
      });
    } catch {
      return Response.json({ error: 'Two-factor verification required' }, { status: 403 });
    }

    await addDataAndFileToRequest(req);
    const email = (req.data as { email?: unknown } | undefined)?.email;
    if (typeof email !== 'string' || email.trim().length === 0 || email.length > 254) {
      return Response.json({ error: 'A target email is required' }, { status: 400 });
    }

    const target = await payload.find({
      collection: 'users',
      where: { email: { equals: email.trim().toLowerCase() } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const targetUser = target.docs[0];
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    if (String(targetUser.id) === String(user.id)) {
      return Response.json(
        { error: 'Use your authenticator code to reset your own enrolment' },
        { status: 400 },
      );
    }

    await payload.update({
      collection: 'users',
      id: targetUser.id,
      data: {
        totp: { enabled: false, secret: '', backupCodes: [], lastCounter: null },
      },
      overrideAccess: true,
      req,
    });

    await writeAuditLog({
      payload,
      req,
      action: 'totp_reenrolled',
      collectionSlug: 'users',
      documentId: String(targetUser.id),
      actorId: user.id,
      summary: 'Two-factor reset by a Super Admin',
      ipHash: hashIp(req.headers),
    });

    return Response.json({ ok: true });
  },
};
