import type { CollectionConfig } from 'payload';

import { hashIp, writeAuditLog } from './log';

/**
 * Collection hooks that write the audit trail (CP-2.3).
 *
 * They are small adapters: detection and wording live here, persistence lives
 * in `writeAuditLog`. Every hook returns the document it was given where the
 * hook contract expects one, and none of them throws — an audit failure must
 * never break a login, save or delete.
 */

type CollectionHooks = NonNullable<CollectionConfig['hooks']>;
type AfterLogin = NonNullable<CollectionHooks['afterLogin']>[number];
type AfterError = NonNullable<CollectionHooks['afterError']>[number];
type AfterChange = NonNullable<CollectionHooks['afterChange']>[number];
type AfterDelete = NonNullable<CollectionHooks['afterDelete']>[number];

const LOCKED_ERRORS = new Set(['AuthenticationError', 'LockedAuth']);

/** True for the errors Payload throws when credentials fail or the account is locked. */
export function isLoginFailure(error: Error | undefined): boolean {
  return Boolean(error && LOCKED_ERRORS.has(error.name));
}

export const auditLogin: AfterLogin = async ({ req, user }) => {
  await writeAuditLog({
    payload: req.payload,
    req,
    action: 'login',
    collectionSlug: 'users',
    documentId: String(user.id),
    actorId: user.id,
    summary: 'Staff signed in (first factor)',
    ipHash: hashIp(req.headers),
  });
};

/**
 * Payload runs `afterError` on REST/GraphQL errors. Local API calls do not run
 * it, so the same adapter is callable directly in tests.
 */
export const auditLoginError: AfterError = async ({ error, req }) => {
  if (!isLoginFailure(error)) return;

  await writeAuditLog({
    payload: req.payload,
    req,
    action: 'login_failed',
    collectionSlug: 'users',
    summary:
      error.name === 'LockedAuth' ? 'Login refused: account locked' : 'Failed staff login attempt',
    ipHash: hashIp(req.headers),
  });
};

export const auditUserChange: AfterChange = async ({ doc, operation, req }) => {
  const action = operation === 'create' ? 'user_created' : 'user_updated';

  await writeAuditLog({
    payload: req.payload,
    req,
    action,
    collectionSlug: 'users',
    documentId: String(doc.id),
    actorId: req.user?.id,
    summary:
      operation === 'create'
        ? `Created staff account #${doc.id}`
        : `Updated staff account #${doc.id}`,
    ipHash: hashIp(req.headers),
  });

  return doc;
};

export const auditUserDelete: AfterDelete = async ({ doc, req }) => {
  await writeAuditLog({
    payload: req.payload,
    req,
    action: 'user_deleted',
    collectionSlug: 'users',
    documentId: String(doc.id),
    actorId: req.user?.id,
    summary: `Deleted staff account #${doc.id}`,
    ipHash: hashIp(req.headers),
  });

  return doc;
};

/**
 * Logs only a status transition, so ordinary draft saves do not flood the log.
 * Runs for both manual and scheduled publishing.
 */
export function auditPublishFor(collectionSlug: string, noun: string): AfterChange {
  return async ({ doc, previousDoc, req }) => {
    const before = previousDoc?._status;
    const after = doc._status;
    if (before === after) return doc;

    const action = after === 'published' ? 'publish' : before === 'published' ? 'unpublish' : null;
    if (!action) return doc;

    await writeAuditLog({
      payload: req.payload,
      req,
      action,
      collectionSlug,
      documentId: String(doc.id),
      actorId: req.user?.id,
      summary: `${action === 'publish' ? 'Published' : 'Unpublished'} ${noun} #${doc.id}`,
      ipHash: hashIp(req.headers),
    });

    return doc;
  };
}

export const auditPublish = auditPublishFor('pages', 'page');

/** A delete entry for any collection that has one. */
export function auditDelete(collectionSlug: string): AfterDelete {
  return async ({ doc, req }) => {
    await writeAuditLog({
      payload: req.payload,
      req,
      action: 'delete',
      collectionSlug,
      documentId: String(doc.id),
      actorId: req.user?.id,
      summary: `Deleted ${collectionSlug} document #${doc.id}`,
      ipHash: hashIp(req.headers),
    });

    return doc;
  };
}
