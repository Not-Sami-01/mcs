import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';
import { handleTotpAuditEvent, registerAuditPayload, writeAuditLog } from './log';

// Vitest does not load .env files the way `next dev`/`next start` do.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env — the environment may provide the variables
}
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local — nothing to override
}

const PLACEHOLDER = 'ci-placeholder';
const enabled = Boolean(
  process.env.DATABASE_URL &&
  process.env.PAYLOAD_SECRET &&
  process.env.PAYLOAD_SECRET !== PLACEHOLDER,
);

const config = enabled ? (await import('../payload.config')).default : null;

let sequence = 0;
const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${sequence++}@example.invalid`;
const uniqueSlug = (prefix: string) => `${prefix}-${Date.now()}-${sequence++}`;
const PASSWORD = 'audit-test-password-value';

describe.skipIf(!enabled)('audit log (CP-2.3)', () => {
  let payload: Payload;
  let superAdmin: { id: number | string; email: string };
  let editor: { id: number | string; email: string };
  const createdUserIds: (number | string)[] = [];
  const createdPageIds: (number | string)[] = [];
  const EXTRA_DOCUMENT_ID = 'audit-access-test';

  /** The bootstrap path always assigns Super Admin (CP-2.1). */
  const createBootstrapUser = async (email = uniqueEmail('cp23-user')) => {
    const user = await payload.create({
      collection: 'users',
      data: { email, roles: ['editor'], password: PASSWORD },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });
    createdUserIds.push(user.id);
    return user;
  };

  /** A Super Admin creates a real Editor; the typed password is discarded. */
  const createEditor = async (email = uniqueEmail('cp23-editor')) => {
    const user = await payload.create({
      collection: 'users',
      data: { email, roles: ['editor'], password: PASSWORD },
      user: { ...superAdmin, totp: { enabled: true } },
      overrideAccess: false,
    });
    createdUserIds.push(user.id);
    return user;
  };

  const entriesFor = (documentId: string | number, collectionSlug: string) =>
    payload.find({
      collection: 'audit-logs',
      where: {
        and: [
          { documentId: { equals: String(documentId) } },
          { collectionSlug: { equals: collectionSlug } },
        ],
      },
      sort: 'createdAt',
      limit: 100,
      overrideAccess: true,
    });

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });
    registerAuditPayload(payload);

    superAdmin = await createBootstrapUser();
    editor = await createEditor();
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;

    for (const id of createdPageIds) {
      await payload
        .delete({ collection: 'pages', id, overrideAccess: true })
        .catch(() => undefined);
    }
    for (const id of createdUserIds) {
      await payload
        .delete({ collection: 'users', id, overrideAccess: true })
        .catch(() => undefined);
    }

    const trackable = [...createdUserIds, ...createdPageIds, EXTRA_DOCUMENT_ID].map(String);
    const leftover = await payload.find({
      collection: 'audit-logs',
      where: { documentId: { in: trackable } },
      limit: 1000,
      overrideAccess: true,
    });
    for (const entry of leftover.docs) {
      await payload
        .delete({ collection: 'audit-logs', id: entry.id, overrideAccess: true })
        .catch(() => undefined);
    }

    await payload.destroy();
  });

  it('is write-only for the server and readable by a Super Admin alone', async () => {
    await writeAuditLog({
      payload,
      action: 'export',
      collectionSlug: 'products',
      documentId: EXTRA_DOCUMENT_ID,
      summary: 'Exported the product list',
    });

    const asSuper = await payload.find({
      collection: 'audit-logs',
      where: { documentId: { equals: EXTRA_DOCUMENT_ID } },
      overrideAccess: false,
      user: { ...superAdmin, totp: { enabled: true } },
    });
    expect(asSuper.docs).toHaveLength(1);

    await expect(
      payload.find({
        collection: 'audit-logs',
        limit: 1,
        overrideAccess: false,
        user: { ...editor, totp: { enabled: true } },
      }),
    ).rejects.toThrow();

    // No HTTP path may create, edit or delete an audit entry, whatever the role.
    const actor = { ...superAdmin, totp: { enabled: true } };
    await expect(
      payload.create({
        collection: 'audit-logs',
        data: { action: 'login', summary: 'forged' },
        overrideAccess: false,
        user: actor,
      }),
    ).rejects.toThrow();
    await expect(
      payload.update({
        collection: 'audit-logs',
        id: asSuper.docs[0].id,
        data: { summary: 'edited' },
        overrideAccess: false,
        user: actor,
      }),
    ).rejects.toThrow();
    await expect(
      payload.delete({
        collection: 'audit-logs',
        id: asSuper.docs[0].id,
        overrideAccess: false,
        user: actor,
      }),
    ).rejects.toThrow();
  });

  it('records staff creation, update, first-factor login and deletion', async () => {
    const email = uniqueEmail('cp23-lifecycle');
    const user = await createBootstrapUser(email);

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { roles: ['sales-support'] },
      overrideAccess: true,
    });
    await payload.login({ collection: 'users', data: { email, password: PASSWORD } });
    await payload.delete({ collection: 'users', id: user.id, overrideAccess: true });

    const entries = await entriesFor(user.id, 'users');
    const actions = entries.docs.map((entry) => entry.action);
    expect(actions).toContain('user_created');
    expect(actions).toContain('user_updated');
    expect(actions).toContain('login');
    expect(actions).toContain('user_deleted');
    // No email, password, token or TOTP secret leaks into an entry.
    const serialised = JSON.stringify(entries.docs);
    expect(serialised).not.toContain(email);
    expect(serialised).not.toContain(PASSWORD);
  });

  it('records publish and unpublish transitions, not ordinary draft saves', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Audit lifecycle page',
        slug: uniqueSlug('cp23-page'),
        template: 'standard',
        layout: [],
      },
      draft: true,
      overrideAccess: true,
    });
    createdPageIds.push(page.id);

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { _status: 'draft' },
      draft: true,
      overrideAccess: true,
    });
    expect((await entriesFor(page.id, 'pages')).docs).toHaveLength(0);

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { _status: 'published' },
      draft: false,
      overrideAccess: true,
    });
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { _status: 'draft' },
      draft: true,
      overrideAccess: true,
    });

    const actions = (await entriesFor(page.id, 'pages')).docs.map((entry) => entry.action);
    expect(actions).toEqual(['publish', 'unpublish']);
  }, 120_000);

  it('records two-factor events through the plugin adapter', async () => {
    await handleTotpAuditEvent({
      action: 'totp.validate.success',
      userId: superAdmin.id,
    });
    await handleTotpAuditEvent({
      action: 'totp.rate-limit.lockout',
      userId: superAdmin.id,
    });

    const actions = (await entriesFor(superAdmin.id, 'users')).docs.map((entry) => entry.action);
    expect(actions).toContain('totp_verified');
    expect(actions).toContain('totp_locked');
  });
});
