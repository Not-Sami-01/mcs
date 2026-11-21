import { getPayload } from 'payload';

import { COUNT_LIMITS } from '../cms/limits';
import config from '../payload.config';
import { sampleCategory, samplePages } from './content';
import { validateSeedEnvironment } from './guard';

export { sampleCategory, samplePages } from './content';
export { validateSeedEnvironment } from './guard';

export async function seedSampleContent(): Promise<void> {
  validateSeedEnvironment();

  if (
    samplePages.length < COUNT_LIMITS.seedSamplePages.min ||
    samplePages.length > COUNT_LIMITS.seedSamplePages.max
  ) {
    throw new Error('Sample page count is outside the configured seed limits.');
  }

  const payload = await getPayload({ config });

  try {
    await payload.findGlobal({ slug: 'site-settings', overrideAccess: true });
    await payload.findGlobal({ slug: 'navigation', overrideAccess: true });

    const existingCategory = await payload.find({
      collection: 'categories',
      where: { slug: { equals: sampleCategory.slug } },
      limit: 1,
      overrideAccess: true,
    });
    const categoryDoc = existingCategory.docs[0];

    if (categoryDoc && categoryDoc.title !== sampleCategory.title) {
      throw new Error(
        `Category slug "${sampleCategory.slug}" is already used by non-sample content.`,
      );
    }

    const existingSamplePages = await Promise.all(
      samplePages.map(async (page) => {
        const result = await payload.find({
          collection: 'pages',
          where: { slug: { equals: page.slug } },
          limit: 1,
          overrideAccess: true,
        });
        const existing = result.docs[0];

        if (existing && existing.title !== page.title) {
          throw new Error(`Page slug "${page.slug}" is already used by non-sample content.`);
        }

        return existing;
      }),
    );

    console.info(
      'Adding clearly marked SAMPLE content. Existing content and contact settings are untouched.',
    );

    const category =
      categoryDoc ??
      (await payload.create({
        collection: 'categories',
        overrideAccess: true,
        data: sampleCategory,
      }));

    for (const [index, page] of samplePages.entries()) {
      if (existingSamplePages[index]) {
        console.info(`Sample page "${page.slug}" already exists; leaving it unchanged.`);
        continue;
      }

      await payload.create({
        collection: 'pages',
        overrideAccess: true,
        data: { ...page, category: category.id, _status: 'draft' },
      });
    }

    console.info(`Sample seed is complete (${samplePages.length} configured page(s)).`);
  } finally {
    await payload.destroy();
  }
}

/**
 * Payload's bin runner logs a rejected script but still exits 0
 * (`payload/dist/bin/index.js` `runBinScript`), so a failed seed must set the
 * exit code itself or CI would treat a refusal as success.
 */
export const script = async (): Promise<void> => {
  try {
    await seedSampleContent();
  } catch (error) {
    process.exitCode = 1;
    throw error;
  }
};
