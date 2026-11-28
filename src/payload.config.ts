import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { totpPlugin } from '@purposeinplay/payload-totp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { handleTotpAuditEvent, registerAuditPayload } from './audit/log';
import { COLLECTIONS } from './collections';
import { GLOBALS } from './globals';
import { Users } from './collections/Users';
import { publicFileUrl } from './cms/media-urls';
import { getSiteEnvironment } from './config/site-env';

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

// CSRF/CORS allowlist (docs/SECURITY.md C3): our own origin only, never `*`.
// Local development also accepts the default Next.js origin so `pnpm dev` keeps
// working when NEXT_PUBLIC_SITE_URL points at staging.
const siteURL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);
const allowedOrigins = Array.from(
  new Set([siteURL, ...(getSiteEnvironment() === 'production' ? [] : ['http://localhost:3000'])]),
);

export default buildConfig({
  serverURL: siteURL,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // Opt-in entry for two-factor setup; hidden once enrolled.
      afterNavLinks: ['/components/admin/TwoFactorLink'],
      // Branded sign-in screen and nav mark (2026-11-28).
      graphics: {
        Icon: '/components/admin/AdminIcon',
        Logo: '/components/admin/AdminLogo',
      },
      // Replaces Payload's collection grid with content stats and activity.
      views: {
        dashboard: {
          Component: '/components/admin/Dashboard',
        },
      },
    },
  },
  collections: COLLECTIONS,
  globals: GLOBALS,
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
    // CP-2.2 two-factor login (ADR-008): TOTP with AES-256-GCM secrets at rest,
    // hashed recovery codes and REST/GraphQL enforcement for enrolled accounts.
    // Keep this plugin after any plugin that adds collections (its README).
    totpPlugin({
      authCollectionSlug: 'users',
      issuer: 'MCS Admin',
      // Enrolment is optional (2026-11-24 client request): unenrolled staff can
      // use the admin and data API, and can opt in at /admin/setup-totp.
      // Accounts that did enrol must still present a code on every login.
      forceSetup: false,
      // The token re-issued after verification must keep the two-hour staff
      // session from CP-2.1; the plugin's default is seven days.
      tokenExpiration: '2h',
      // CP-2.3: map the plugin's security events into the audit log.
      onAuditEvent: handleTotpAuditEvent,
    }),
  ],
  onInit: async (payload) => {
    // The plugin's audit callback has no request, so it needs the instance.
    registerAuditPayload(payload);
  },
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
