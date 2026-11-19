import type { Metadata } from 'next';
import { getPayload } from 'payload';

import config from '@payload-config';

export const metadata: Metadata = {
  title: 'Media delivery test',
  // Internal CP-1.1 evidence page: never indexable, whatever SITE_ENV says.
  robots: { index: false, follow: false },
};

/**
 * CP-1.1 exit-criterion page: real uploads from the Filebase-backed `media`
 * collection, served through the path chosen in ADR-015 — Payload's media route
 * while `FILEBASE_PUBLIC_BASE_URL` is empty (bucket private), direct Filebase
 * URLs once it is set (bucket public).
 *
 * Rendered at build time like every other public page (AGENTS.md rule 6), so a
 * rebuild picks up newly uploaded test media. The library is empty in CI
 * (Filebase tests are skipped there), which renders the notice below instead.
 */
export default async function MediaTestPage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'media',
    limit: 20,
    sort: '-createdAt',
    depth: 0,
  });

  const directBase = process.env.FILEBASE_PUBLIC_BASE_URL?.trim();
  const delivery = directBase
    ? `Filebase direct (${directBase})`
    : "Payload's media route (FILEBASE_PUBLIC_BASE_URL empty)";

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
        Malaysian Care System
      </p>
      <h1 className="text-3xl font-semibold text-neutral-900">Media delivery test</h1>
      <p className="mt-4 text-neutral-600">
        Every image below was uploaded through the admin panel, stored in Filebase and is served
        through <span className="font-medium">{delivery}</span>. Alt text is required before an
        image can be saved.
      </p>

      {docs.length === 0 ? (
        <p className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
          The media library is empty. Upload an image in the admin panel, then rebuild this page.
        </p>
      ) : (
        <ul className="mt-8 space-y-10">
          {docs.map((doc) => {
            // Pre-generated WebP variants as a responsive srcset (ADR-015: no optimizer).
            const srcSet = [doc.sizes?.thumb, doc.sizes?.card, doc.sizes?.hero]
              .flatMap((size) => (size?.url && size.width ? [`${size.url} ${size.width}w`] : []))
              .join(', ');

            return (
              <li
                key={doc.id}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ADR-015: pre-generated variants are delivered as-is; the Next optimizer is deliberately not in this path (it rejects ?prefix=media anyway, gotcha 23) */}
                <img
                  src={doc.url ?? ''}
                  srcSet={srcSet || undefined}
                  sizes="(max-width: 767px) 100vw, 767px"
                  alt={doc.alt}
                  width={doc.width ?? undefined}
                  height={doc.height ?? undefined}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full bg-neutral-100"
                />
                <div className="space-y-1 p-4 text-sm">
                  <p className="font-medium break-all text-neutral-900">{doc.filename}</p>
                  <p className="text-neutral-600">{doc.alt}</p>
                  <p className="break-all font-mono text-xs text-neutral-500">{doc.url}</p>
                  <ul className="space-y-1 pt-2">
                    {Object.entries(doc.sizes ?? {}).map(([name, size]) =>
                      size?.url ? (
                        <li key={name} className="break-all font-mono text-xs text-neutral-500">
                          {name}: {size.url} ({size.width ?? '?'}×{size.height ?? '?'},{' '}
                          {size.mimeType ?? '?'}, {size.filesize ?? '?'} B)
                        </li>
                      ) : null,
                    )}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
