import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { COLLECTIONS } from './collections';
import { Users } from './collections/Users';
import { publicFileUrl } from './cms/media-urls';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Names only — never print values (docs/SECURITY.md rule 12).
    throw new Error(`${name} is required. See .env.example.`);
  }
  return value;
}

const databaseURL = requireEnv('DATABASE_URL');
const secret = requireEnv('PAYLOAD_SECRET');

const filebaseEndpoint = requireEnv('FILEBASE_ENDPOINT');
const filebaseRegion = requireEnv('FILEBASE_REGION');
const filebaseBucket = requireEnv('FILEBASE_BUCKET');
const filebaseAccessKeyId = requireEnv('FILEBASE_ACCESS_KEY_ID');
const filebaseSecretAccessKey = requireEnv('FILEBASE_SECRET_ACCESS_KEY');

// Optional (ADR-015): while the bucket is private this stays empty and Payload's
// media route serves every file. Once the bucket is public, set it to the bucket's
// public origin (e.g. https://vaultifier.s3.filebase.io) and every media URL is
// rewritten to point straight at Filebase's edge CDN — an env-only flip, no re-upload.
// Verify the bucket is actually public first (anonymous curl must return 200).
const filebasePublicBaseUrl = process.env.FILEBASE_PUBLIC_BASE_URL?.trim() ?? '';

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: COLLECTIONS,
  plugins: [
    s3Storage({
      bucket: filebaseBucket,
      collections: {
        media: {
          prefix: 'media',
          // ADR-015: direct Filebase URLs only when the bucket is public.
          ...(filebasePublicBaseUrl
            ? {
                generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) =>
                  publicFileUrl({ baseUrl: filebasePublicBaseUrl, prefix, filename }),
              }
            : {}),
        },
      },
      config: {
        endpoint: filebaseEndpoint,
        region: filebaseRegion,
        forcePathStyle: true,
        // The Filebase endpoint can be slow/unreachable in bursts from some
        // networks (observed ETIMEDOUT, 2026-11-19); retry before failing.
        maxAttempts: 5,
        credentials: {
          accessKeyId: filebaseAccessKeyId,
          secretAccessKey: filebaseSecretAccessKey,
        },
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  editor: lexicalEditor(),
  secret,
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
  }),
  sharp,
});
