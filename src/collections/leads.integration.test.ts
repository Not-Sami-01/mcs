import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';
import type { Lead } from '../payload-types';

try {
  process.loadEnvFile('.env');
} catch {}
try {
  process.loadEnvFile('.env.local');
} catch {}

const enabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
const config = enabled ? (await import('../payload.config')).default : null;

describe.skipIf(!enabled)('leads (CP-6.1)', () => {
  let payload: Payload;
  let superAdmin: { id: number };
  let editor: { id: number };
  let sales: { id: number };
  const leadIds: number[] = [];
  const userIds: number[] = [];

  const stamp = Date.now();

  const lead = () => ({
    type: 'quote' as const,
    name: `Lead ${stamp}`,
    phone: '0300 1234567',
    email: `lead-${stamp}@example.com`,
    city: 'Lahore',
    area: 'DHA',
    message: 'Please quote for two rooms.',
    consent: true,
  });

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp61-admin-${stamp}@example.com`,
        password: `cp61-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });
    userIds.push(superAdmin.id);

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp61-editor-${stamp}@example.com`,
        password: `cp61-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });
    userIds.push(editor.id);

    sales = await payload.create({
      collection: 'users',
      data: {
        email: `cp61-sales-${stamp}@example.com`,
        password: `cp61-sales-${stamp}-password`,
        roles: ['sales-support'],
      },
      user: superAdmin,
      overrideAccess: false,
    });
    userIds.push(sales.id);
  }, 60_000);

  afterAll(async () => {
    for (const id of leadIds) {
      await payload.delete({ collection: 'leads', id, overrideAccess: true }).catch(() => null);
    }
    for (const id of userIds) {
      await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => null);
    }
  }, 60_000);

  it('stamps retention from the settings default and the consent time', async () => {
    // Payload's generated create union wants `draft: true` here even though
    // `leads` has no drafts (the overload is chosen for trash-enabled
    // collections); the runtime path is the plain create, covered below.
    const created = (await payload.create({
      collection: 'leads',
      data: lead(),
      user: sales,
      overrideAccess: false,
    } as never)) as Lead;
    leadIds.push(created.id);

    expect(created.leadStatus).toBe('new');
    expect(created.consentAt).toBeTruthy();

    const retain = new Date(String(created.retainUntil));
    const monthsOut = (retain.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44);
    expect(monthsOut).toBeGreaterThan(23);
    expect(monthsOut).toBeLessThan(25);
  });

  it('keeps leads away from roles that do not work the inbox', async () => {
    await expect(
      payload.find({ collection: 'leads', user: editor, overrideAccess: false, limit: 1 }),
    ).rejects.toThrow(/not allowed|Forbidden/i);
  });

  it('lets Sales move a lead through statuses and add notes', async () => {
    // Payload's generated create union wants `draft: true` here even though
    // `leads` has no drafts (the overload is chosen for trash-enabled
    // collections); the runtime path is the plain create, covered below.
    const created = await payload.create({
      collection: 'leads',
      data: lead(),
      user: sales,
      overrideAccess: false,
    } as never);
    leadIds.push(created.id);

    const updated = await payload.update({
      collection: 'leads',
      id: created.id,
      data: {
        leadStatus: 'contacted',
        assignedTo: sales.id,
        notes: [{ author: sales.id, text: 'Called; will visit on Thursday.' }],
      },
      user: sales,
      overrideAccess: false,
    });

    expect(updated.leadStatus).toBe('contacted');
    expect(updated.assignedTo).toEqual(expect.objectContaining({ id: sales.id }));
    expect(updated.notes).toHaveLength(1);
    expect(updated.notes?.[0]?.text).toBe('Called; will visit on Thursday.');
    expect(updated.notes?.[0]?.createdAt).toBeTruthy();
  });

  it('only a Super Admin may delete a lead', async () => {
    // Payload's generated create union wants `draft: true` here even though
    // `leads` has no drafts (the overload is chosen for trash-enabled
    // collections); the runtime path is the plain create, covered below.
    const created = await payload.create({
      collection: 'leads',
      data: lead(),
      user: sales,
      overrideAccess: false,
    } as never);
    leadIds.push(created.id);

    await expect(
      payload.delete({ collection: 'leads', id: created.id, user: sales, overrideAccess: false }),
    ).rejects.toThrow(/not allowed|Forbidden/i);

    await payload.delete({
      collection: 'leads',
      id: created.id,
      user: superAdmin,
      overrideAccess: false,
    });
    leadIds.splice(leadIds.indexOf(created.id), 1);
  });
});
