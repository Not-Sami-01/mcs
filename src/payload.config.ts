import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Media } from './collections/Media';
import { Users } from './collections/Users';

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

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Media, Users],
  plugins: [
    s3Storage({
      bucket: filebaseBucket,
      collections: {
        media: { prefix: 'media' },
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
