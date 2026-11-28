import { getPayload } from 'payload';
import { Client } from 'pg';
import sharp from 'sharp';

import config from '../../payload.config';
import { validateSeedEnvironment } from '../guard';
import { navigation, siteSettings } from './chrome';
import { homeTop } from './home-a';
import { homeBottom } from './home-b';
import { locations } from './locations';
import { moreLocations } from './locations-2';
import { pageGroupA } from './pages-a';
import { pageGroupB } from './pages-b';
import { postsA } from './posts-a';
import { postsB } from './posts-b';
import { products } from './products';
import { services } from './services';
import { moreServices } from './services-2';

/**
 * Seed a complete, browsable demo site (`content-plan.md`).
 *
 * Destructive by design: content tables and the two globals are reset, then
 * rebuilt. Users and audit logs are never touched. Refuses production.
 */

const CONTENT_TABLES = [
  'pages',
  '_pages_v',
  'services',
  '_services_v',
  'locations',
  '_locations_v',
  'products',
  '_products_v',
  'posts',
  '_posts_v',
  'categories',
  'media',
  'price_history',
  'site_settings',
  'navigation',
].join(', ');

/** A Local-API identity so publish gates run as a Super Admin. Not a real user. */
const seedUser = { id: 1, email: 'seed@mcs.local', roles: ['super-admin'] };

type Created = Record<string, number | string>;

type MediaInput = { name: string; width: number; height: number; text: string; alt: string };

async function uploadPlaceholder(
  payload: Awaited<ReturnType<typeof getPayload>>,
  input: MediaInput,
): Promise<number | undefined> {
  try {
    // A quiet limewash panel with the item name in small deep-green type. The
    // old placeholder service drew a giant centred title that read as slop and
    // needed the network to build the demo site.
    const label = input.text.replace(/[<>&]/g, '').slice(0, 60);
    const fontSize = Math.max(18, Math.round(input.width / 32));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}">
      <rect width="100%" height="100%" fill="#f2efe4"/>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#ddd9cb" stroke-width="2"/>
      <text x="${Math.round(input.width / 24)}" y="${input.height - Math.round(input.width / 24)}"
        font-family="DejaVu Sans, sans-serif" font-size="${fontSize}" fill="#0d4a35">${label}</text>
    </svg>`;
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

    const media = await payload.create({
      collection: 'media',
      data: { alt: input.alt },
      file: {
        data: buffer,
        mimetype: 'image/png',
        name: input.name,
        size: buffer.length,
      },
      user: seedUser,
      overrideAccess: true,
      disableTransaction: true,
    });

    console.info(`  media ${input.name}`);
    return media.id as number;
  } catch (error) {
    console.warn(
      `  media skipped (${input.name}): ${error instanceof Error ? error.message : 'unknown error'}`,
    );
    return undefined;
  }
}

export async function seedSite(): Promise<void> {
  validateSeedEnvironment();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required.');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(`TRUNCATE TABLE ${CONTENT_TABLES} RESTART IDENTITY CASCADE`);
    console.info('Content tables reset (users and audit logs untouched).');
  } finally {
    await client.end();
  }

  const payload = await getPayload({ config });

  const asUser = { user: seedUser, overrideAccess: true } as const;
  // Seeding has no request transaction. Without this, a best-effort audit or
  // price-history insert can abort the shared transaction and roll back the
  // document that triggered it.
  const writeOpts = { ...asUser, disableTransaction: true } as const;

  try {
    await payload.updateGlobal({ slug: 'site-settings', data: siteSettings, ...asUser });
    await payload.updateGlobal({ slug: 'navigation', data: navigation as never, ...asUser });
    console.info('Globals updated.');

    const heroImage = await uploadPlaceholder(payload, {
      name: 'home-hero.png',
      width: 1600,
      height: 900,
      text: 'Pest control in Lahore',
      alt: 'Green placeholder panel for the MCS pest control hero image',
    });
    const aboutImage = await uploadPlaceholder(payload, {
      name: 'about-mcs.png',
      width: 1200,
      height: 800,
      text: 'Malaysian Care System',
      alt: 'Green placeholder panel for the MCS team photograph',
    });

    const productIds: Created = {};
    for (const product of products) {
      const image = await uploadPlaceholder(payload, {
        name: `product-${product.slug}.png`,
        width: 800,
        height: 800,
        text: product.title,
        alt: `Green placeholder image for ${product.title}`,
      });

      const doc = await payload.create({
        collection: 'products',
        data: {
          ...product,
          images: image ? [{ image }] : [],
          _status: 'published',
        } as never,
        ...writeOpts,
      });
      productIds[product.slug] = doc.id;
    }
    console.info(`Products: ${products.length}`);

    const serviceIds: Created = {};
    for (const service of [...services, ...moreServices]) {
      const hero = await uploadPlaceholder(payload, {
        name: `service-${service.slug}.png`,
        width: 1200,
        height: 800,
        text: service.title,
        alt: `Green placeholder image for the ${service.title} service`,
      });

      const doc = await payload.create({
        collection: 'services',
        data: { ...service, ...(hero ? { heroImage: hero } : {}), _status: 'published' } as never,
        ...writeOpts,
      });
      serviceIds[service.slug] = doc.id;
    }
    console.info(`Services: ${services.length + moreServices.length}`);

    const locationIds: Created = {};
    const allLocations = [...locations, ...moreLocations];
    const cityId = (() => {
      const city = allLocations.find((entry) => entry.type === 'city');
      return city?.slug;
    })();

    for (const location of allLocations) {
      const parentSlug = location.type === 'area' ? cityId : undefined;
      const doc = await payload.create({
        collection: 'locations',
        data: {
          ...location,
          parent: parentSlug ? locationIds[parentSlug] : undefined,
          servicesAvailable: Object.values(serviceIds),
          _status: 'published',
        } as never,
        ...writeOpts,
      });
      locationIds[location.slug] = doc.id;
    }
    console.info(`Locations: ${allLocations.length}`);

    const allAreaIds = Object.values(locationIds);
    for (const service of [...services, ...moreServices]) {
      await payload.update({
        collection: 'services',
        id: serviceIds[service.slug],
        data: { areasServed: allAreaIds } as never,
        ...writeOpts,
      });
    }

    const pages = [
      {
        title: 'Home',
        slug: 'home',
        template: 'standard' as const,
        seo: {
          metaTitle: 'Pest Control in Lahore',
          metaDescription:
            'Professional pest control in Lahore for homes and businesses. Explore treatments, book a free inspection and get a clear quote.',
        },
        layout: [{ ...homeTop[0], image: heroImage }, ...homeTop.slice(1), ...homeBottom],
      },
      ...pageGroupA.map((page) => ({
        ...page,
        layout: page.layout.map((block) =>
          block.blockType === 'hero' && page.slug === 'about-us' && aboutImage
            ? { ...block, image: aboutImage }
            : block,
        ),
      })),
      ...pageGroupB,
    ];

    for (const page of pages) {
      await payload.create({
        collection: 'pages',
        data: { ...page, _status: 'published', publishedAt: new Date().toISOString() } as never,
        ...writeOpts,
      });
    }
    console.info(`Pages: ${pages.length}`);

    const allPosts = [...postsA, ...postsB];
    for (const post of allPosts) {
      const cover = await uploadPlaceholder(payload, {
        name: `guide-${post.slug}.png`,
        width: 1200,
        height: 675,
        text: 'MCS Pest Library',
        alt: `Green placeholder cover for the article ${post.title}`,
      });

      await payload.create({
        collection: 'posts',
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          publishedAt: post.publishedAt,
          seo: post.seo,
          coverImage: cover,
          relatedServices: [serviceIds[post.serviceSlug]].filter(Boolean),
          relatedLocations: [locationIds[post.locationSlug]].filter(Boolean),
          _status: 'published',
        } as never,
        ...writeOpts,
      });
    }
    console.info(`Pest Library articles: ${allPosts.length}`);
    console.info('Demo site seed complete.');
  } finally {
    await payload.destroy();
  }
}
