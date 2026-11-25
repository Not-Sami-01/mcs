import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';

try {
  process.loadEnvFile('.env');
} catch {}
try {
  process.loadEnvFile('.env.local');
} catch {}

const enabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
const config = enabled ? (await import('../payload.config')).default : null;

describe.skipIf(!enabled)('services collection (CP-5.1)', () => {
  let payload: Payload;
  let serviceId: number | string;
  let superAdmin: { id: number | string };
  let editor: { id: number | string };
  let sales: { id: number | string };

  const stamp = Date.now();
  const slug = `cp51-service-${stamp}`;

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp51-admin-${stamp}@example.com`,
        password: `cp51-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp51-editor-${stamp}@example.com`,
        password: `cp51-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    sales = await payload.create({
      collection: 'users',
      data: {
        email: `cp51-sales-${stamp}@example.com`,
        password: `cp51-sales-${stamp}-password`,
        roles: ['sales-support'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    const service = await payload.create({
      collection: 'services',
      data: {
        title: `CP-5.1 service ${stamp}`,
        slug,
        shortDescription: 'Fixture service description.',
        startingPrice: 5000,
        priceUnit: 'per inspection',
        _status: 'draft',
        signs: [
          { sign: 'Fixture sign one' },
          { sign: 'Fixture sign two' },
          { sign: 'Fixture sign three' },
        ],
        treatmentSteps: [
          { title: 'Inspect', body: 'We inspect the property.' },
          { title: 'Treat', body: 'We treat the affected areas.' },
          { title: 'Follow up', body: 'We check the result.' },
        ],
        faqs: [
          { question: 'Question one?', answer: 'Answer one.' },
          { question: 'Question two?', answer: 'Answer two.' },
          { question: 'Question three?', answer: 'Answer three.' },
        ],
        seo: { metaTitle: 'Fixture service', metaDescription: 'Fixture service description.' },
      },
      user: editor,
      overrideAccess: false,
    });
    serviceId = service.id;
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    if (serviceId) {
      await payload
        .delete({ collection: 'services', id: serviceId, overrideAccess: true })
        .catch(() => {});
    }
    for (const user of [editor, sales, superAdmin]) {
      if (user) {
        await payload
          .delete({ collection: 'users', id: user.id, overrideAccess: true })
          .catch(() => {});
      }
    }
    await payload.destroy();
  });

  it('keeps an unpublished service out of public reads', async () => {
    const { findPublishedServiceBySlug, listPublishedServices } = await import('../cms/services');

    expect(await findPublishedServiceBySlug(slug)).toBeNull();
    expect((await listPublishedServices()).some((service) => service.id === serviceId)).toBe(false);
  });

  it('rejects creating a service without content access', async () => {
    await expect(
      payload.create({
        collection: 'services',
        data: {
          title: 'Denied',
          slug: `cp51-denied-${stamp}`,
          shortDescription: 'Denied',
          signs: [{ sign: 'A' }, { sign: 'B' }, { sign: 'C' }],
          treatmentSteps: [
            { title: 'A', body: 'A' },
            { title: 'B', body: 'B' },
            { title: 'C', body: 'C' },
          ],
          faqs: [
            { question: 'A?', answer: 'A' },
            { question: 'B?', answer: 'B' },
            { question: 'C?', answer: 'C' },
          ],
        },
        user: sales,
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });

  it('rejects a draft that misses the documented list minimums', async () => {
    await expect(
      payload.update({
        collection: 'services',
        id: serviceId,
        data: { signs: [{ sign: 'Only one' }] },
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });

  it('serves a published service by slug and orders it in the list', async () => {
    await payload.update({
      collection: 'services',
      id: serviceId,
      data: { _status: 'published' },
      user: editor,
      overrideAccess: false,
    });

    const { findPublishedServiceBySlug, listPublishedServiceSlugs, listPublishedServices } =
      await import('../cms/services');

    const found = await findPublishedServiceBySlug(slug);
    expect(found).toMatchObject({ id: serviceId, title: `CP-5.1 service ${stamp}` });
    expect(found?.signs?.length).toBe(3);
    expect(found?.treatmentSteps?.length).toBe(3);
    expect(found?.seo?.metaTitle).toBe('Fixture service');

    expect(await listPublishedServiceSlugs()).toContain(slug);
    expect((await listPublishedServices()).some((service) => service.id === serviceId)).toBe(true);
  });

  it('keeps published content stable when the draft changes again', async () => {
    await payload.update({
      collection: 'services',
      id: serviceId,
      data: { title: `CP-5.1 draft title ${stamp}` },
      draft: true,
      user: editor,
      overrideAccess: false,
    });

    const { findPublishedServiceBySlug } = await import('../cms/services');
    expect((await findPublishedServiceBySlug(slug))?.title).toBe(`CP-5.1 service ${stamp}`);
  });
});
