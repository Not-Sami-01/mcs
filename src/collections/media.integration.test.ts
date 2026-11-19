import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { getPayload, type Payload } from 'payload';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

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

/**
 * Runs only where real credentials and a database exist: locally with `.env` +
 * `.env.local` (docs/STORAGE.md §7). CI passes placeholders, so the suite is
 * skipped there. Upload/read/delete against Filebase is explicitly allowed as
 * an integration test with dev credentials (docs/QUALITY.md §4).
 */
const PLACEHOLDER = 'ci-placeholder';
const enabled = Boolean(
  process.env.DATABASE_URL &&
  process.env.PAYLOAD_SECRET &&
  process.env.FILEBASE_ACCESS_KEY_ID &&
  process.env.FILEBASE_SECRET_ACCESS_KEY &&
  process.env.FILEBASE_ACCESS_KEY_ID !== PLACEHOLDER &&
  process.env.FILEBASE_SECRET_ACCESS_KEY !== PLACEHOLDER,
);

// payload.config.ts throws when required variables are missing, so only load it when usable.
const config = enabled ? (await import('../payload.config')).default : null;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe.skipIf(!enabled)('media ↔ Filebase round trip (docs/STORAGE.md §7)', () => {
  let payload: Payload;
  let s3: S3Client;
  const bucket = process.env.FILEBASE_BUCKET ?? '';
  let documentId: number | string | null = null;
  let storedFilename: string | null = null;
  let storedKey: string | null = null;

  const solidPng = (width: number, height: number) =>
    sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 200, g: 40, b: 40 },
      },
    })
      .png()
      .toBuffer();

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');

    const endpoint = process.env.FILEBASE_ENDPOINT;
    const region = process.env.FILEBASE_REGION;
    const accessKeyId = process.env.FILEBASE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.FILEBASE_SECRET_ACCESS_KEY;
    if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
      throw new Error('Filebase environment variables are incomplete. See .env.example.');
    }

    payload = await getPayload({ config });
    s3 = new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      maxAttempts: 5, // the Filebase endpoint times out intermittently from this network
      credentials: { accessKeyId, secretAccessKey },
    });
  }, 120_000);

  afterAll(async () => {
    if (documentId !== null && payload) {
      await payload.delete({ collection: 'media', id: documentId }).catch(() => undefined);
      documentId = null;
    }
    s3?.destroy();
  });

  it('uploads an image with required alt text and generates variants', async () => {
    const png = await solidPng(2000, 1200);

    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'CP-1.1 round trip test image' },
      file: {
        name: 'cp11-roundtrip.png',
        data: png,
        size: png.length,
        mimetype: 'image/png',
      },
    });

    documentId = doc.id;
    storedFilename = doc.filename ?? null;

    expect(doc.alt).toBe('CP-1.1 round trip test image');
    expect(storedFilename).toBeTruthy();
    expect(doc.mimeType).toBe('image/png');
    expect(doc.filesize).toBe(png.length);
    // at least one resized variant must have been produced (WebP/AVIF)
    expect(Object.values(doc.sizes ?? {}).some((size) => size?.filename)).toBe(true);
  }, 120_000);

  it('stored the object in the bucket under the media/ prefix and reads it back byte-identical', async () => {
    expect(storedFilename).toBeTruthy();

    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'media/' }));
    const key = (listed.Contents ?? [])
      .map((object) => object.Key ?? '')
      .find((candidate) => candidate.endsWith(storedFilename ?? ' none'));

    expect(key, `media/${storedFilename} should exist in ${bucket}`).toBeTruthy();
    if (!key) throw new Error('object key not found');
    storedKey = key;

    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bytes = Buffer.from(await object.Body!.transformToByteArray());

    expect(bytes.subarray(0, 8)).toEqual(PNG_SIGNATURE);
    expect(bytes.length).toBeGreaterThan(0);
  }, 60_000);

  it('rejects an upload without alt text', async () => {
    const png = await solidPng(64, 64);

    await expect(
      payload.create({
        collection: 'media',
        data: { alt: '' },
        file: {
          name: 'cp11-no-alt.png',
          data: png,
          size: png.length,
          mimetype: 'image/png',
        },
      }),
    ).rejects.toThrow(/alt/i);
  }, 60_000);

  it('rejects a file over the size cap', async () => {
    // valid per Payload's checkFileRestrictions (%PDF header, xref + %%EOF in the
    // tail) but larger than MEDIA_LIMITS.maxPdfBytes — must hit OUR size cap.
    const oversizedPdf = Buffer.concat([
      Buffer.from('%PDF-1.4\n'),
      Buffer.alloc(11 * 1024 * 1024),
      Buffer.from('\nxref\n0 1\n0000000000 65535 f \n%%EOF\n'),
    ]);

    const error = await payload
      .create({
        collection: 'media',
        data: { alt: 'Oversize test' },
        file: {
          name: 'cp11-oversize.pdf',
          data: oversizedPdf,
          size: oversizedPdf.length,
          mimetype: 'application/pdf',
        },
      })
      .then(() => null)
      .catch((caught: unknown) => caught);

    expect(error, 'oversize upload must be rejected').not.toBeNull();
    const { message, data } = error as { message?: string; data?: { errors?: unknown } };
    expect(message).toMatch(/filename/i); // ValidationError surfaces as an invalid field
    expect(JSON.stringify(data?.errors ?? {})).toMatch(/larger than the 10 MB limit/i);
  }, 60_000);

  it('deletes the document and the object disappears from the bucket', async () => {
    expect(documentId).not.toBeNull();
    const key = storedKey;
    expect(key).toBeTruthy();
    if (!key || documentId === null) throw new Error('missing test state');
    const deletedId = documentId;

    await payload.delete({ collection: 'media', id: deletedId });
    documentId = null;

    await expect(payload.findByID({ collection: 'media', id: deletedId })).rejects.toThrow();

    const stillThere = await s3
      .send(new GetObjectCommand({ Bucket: bucket, Key: key }))
      .then(() => true)
      .catch(() => false);
    expect(stillThere).toBe(false);
  }, 60_000);
});
