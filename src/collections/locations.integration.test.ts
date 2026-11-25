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

const stamp = Date.now();

const CITY_NOTES =
  'Model Town is a settled residential neighbourhood with narrow service lanes, ' +
  'many two-storey houses and a large central park. Older kitchens and wooden ' +
  'cupboards are the usual places we find termites, while cockroaches collect ' +
  'around the waste storage behind the market. Mosquitoes breed in the standing ' +
  'water that gathers after heavy monsoon rain. Our teams treat the house, the ' +
  'garden and the water tanks in one visit and return after two weeks to check ' +
  'the result.';

const OTHER_CITY_NOTES =
  'Johar Town stretches along the canal and mixes family homes with small ' +
  'workshops and restaurants. Warehouse and restaurant kitchens bring stored-' +
  'product pests such as rats and beetles, and the open drains near the main ' +
  'road keep mosquito pressure high through the summer. We survey each unit, ' +
  'seal entry points where possible and place monitored bait stations away from ' +
  'children and pets. A written report lists every treated zone.';

const AREA_NOTES =
  'Block C of Model Town is close to the busy commercial road, so shopkeepers ' +
  'and households share the same service lanes. Rats move between the food ' +
  'shops and the residential streets at night, and flies build up around the ' +
  'open bins behind the market. We treat the shops early in the morning, place ' +
  'tamper-resistant bait stations in the lanes and advise on waste handling. ' +
  'A follow-up visit after ten days confirms the population is down.';

let fixtureServiceId: number | string;

function cityData(name: string, slug: string, localNotes: string) {
  return {
    name,
    slug,
    type: 'city' as const,
    intro: `${name} pest control.`,
    localNotes,
    neighbourhoods: [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }],
    commonPests: [{ pest: 'Termites' }, { pest: 'Cockroaches' }],
    servicesAvailable: [Number(fixtureServiceId)],
    faqs: [
      { question: 'How soon can you visit?', answer: 'Usually within two days.' },
      { question: 'Is treatment safe for children?', answer: 'We follow label directions.' },
      { question: 'Do you return?', answer: 'Yes, for a follow-up inspection.' },
    ],
    seo: { metaTitle: `${name} pest control`, metaDescription: `${name} pest control.` },
  };
}

describe.skipIf(!enabled)('locations collection (CP-5.2)', () => {
  let payload: Payload;
  let superAdmin: { id: number | string };
  let editor: { id: number | string };
  let sales: { id: number | string };
  let cityId: number | string;
  let areaId: number | string;

  const citySlug = `cp52-city-${stamp}`;
  const otherCitySlug = `cp52-other-${stamp}`;
  const areaSlug = `cp52-area-${stamp}`;

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp52-admin-${stamp}@example.com`,
        password: `cp52-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp52-editor-${stamp}@example.com`,
        password: `cp52-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    sales = await payload.create({
      collection: 'users',
      data: {
        email: `cp52-sales-${stamp}@example.com`,
        password: `cp52-sales-${stamp}-password`,
        roles: ['sales-support'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    const service = await payload.create({
      collection: 'services',
      data: {
        title: `CP-5.2 service ${stamp}`,
        slug: `cp52-service-${stamp}`,
        shortDescription: 'Fixture service for location relations.',
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
      user: editor,
      overrideAccess: false,
    });
    fixtureServiceId = service.id;

    const city = await payload.create({
      collection: 'locations',
      data: { ...cityData('CP-5.2 City', citySlug, CITY_NOTES), _status: 'draft' },
      user: editor,
      overrideAccess: false,
    });
    cityId = city.id;

    const area = await payload.create({
      collection: 'locations',
      data: {
        ...cityData('CP-5.2 Area', areaSlug, AREA_NOTES),
        type: 'area',
        parent: Number(cityId),
        _status: 'draft',
      },
      user: editor,
      overrideAccess: false,
    });
    areaId = area.id;
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    if (fixtureServiceId) {
      await payload
        .delete({ collection: 'services', id: fixtureServiceId, overrideAccess: true })
        .catch(() => {});
    }
    for (const id of [areaId, cityId]) {
      if (id) {
        await payload.delete({ collection: 'locations', id, overrideAccess: true }).catch(() => {});
      }
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

  it('keeps draft locations out of public reads', async () => {
    const { listPublishedCities } = await import('../cms/locations');
    const cities = await listPublishedCities();

    expect(cities.some((city) => city.id === cityId)).toBe(false);
  });

  it('rejects an area without a city parent and a city with a parent', async () => {
    await expect(
      payload.create({
        collection: 'locations',
        data: { ...cityData('No parent', `cp52-orphan-${stamp}`, AREA_NOTES), type: 'area' },
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/parent city/i);

    await expect(
      payload.create({
        collection: 'locations',
        data: {
          ...cityData('Bad city', `cp52-badcity-${stamp}`, AREA_NOTES),
          parent: Number(cityId),
        },
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/cannot have a parent/i);
  });

  it('rejects creating a location without content access', async () => {
    await expect(
      payload.create({
        collection: 'locations',
        data: cityData('Denied', `cp52-denied-${stamp}`, AREA_NOTES),
        user: sales,
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });

  it('refuses to publish a thin location and says what is missing', async () => {
    await expect(
      payload.update({
        collection: 'locations',
        id: cityId,
        data: {
          localNotes: 'Too short.',
          neighbourhoods: [{ name: 'One' }],
          commonPests: [{ pest: 'Termites' }],
          faqs: [{ question: 'One?', answer: 'One.' }],
          _status: 'published',
        },
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/local notes of at least 400/i);
  });

  it('publishes a complete city and serves it by slug', async () => {
    await payload.update({
      collection: 'locations',
      id: cityId,
      data: { _status: 'published' },
      user: editor,
      overrideAccess: false,
    });

    const { findPublishedArea, findPublishedCityBySlug, listPublishedCities } =
      await import('../cms/locations');

    const found = await findPublishedCityBySlug(citySlug);
    expect(found).toMatchObject({ id: cityId, name: 'CP-5.2 City', type: 'city' });
    expect((await listPublishedCities()).some((city) => city.id === cityId)).toBe(true);

    expect(await findPublishedCityBySlug(`missing-${stamp}`)).toBeNull();
    expect(await findPublishedArea(citySlug, areaSlug)).toBeNull();
  });

  it('scopes an area to its city and refuses near-duplicate copy on publish', async () => {
    await payload.update({
      collection: 'locations',
      id: areaId,
      data: { _status: 'published' },
      user: editor,
      overrideAccess: false,
    });

    const { findPublishedArea } = await import('../cms/locations');
    const found = await findPublishedArea(citySlug, areaSlug);
    expect(found?.area).toMatchObject({ id: areaId, name: 'CP-5.2 Area', type: 'area' });
    expect(String(found?.city.slug)).toBe(citySlug);

    const otherCity = await payload.create({
      collection: 'locations',
      data: {
        ...cityData('CP-5.2 Other', otherCitySlug, OTHER_CITY_NOTES),
        _status: 'published',
      },
      user: editor,
      overrideAccess: false,
    });

    expect(await findPublishedArea(otherCitySlug, areaSlug)).toBeNull();

    const duplicate = await payload.create({
      collection: 'locations',
      data: {
        ...cityData('CP-5.2 Duplicate', `cp52-duplicate-${stamp}`, CITY_NOTES),
        _status: 'draft',
      },
      user: editor,
      overrideAccess: false,
    });

    expect(duplicate.similarityWarning).toMatch(/similar to/i);

    await expect(
      payload.update({
        collection: 'locations',
        id: duplicate.id,
        data: { _status: 'published' },
        user: editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/similar to/i);

    await payload.delete({ collection: 'locations', id: duplicate.id, overrideAccess: true });
    await payload.delete({ collection: 'locations', id: otherCity.id, overrideAccess: true });
  });
});
