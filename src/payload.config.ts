import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Users } from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseURL = process.env.DATABASE_URL;
const secret = process.env.PAYLOAD_SECRET;

if (!databaseURL) {
  throw new Error('DATABASE_URL is required. See .env.example.');
}

if (!secret) {
  throw new Error('PAYLOAD_SECRET is required. See .env.example.');
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users],
  editor: lexicalEditor(),
  secret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
  }),
  sharp,
});
