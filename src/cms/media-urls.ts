/**
 * Direct public URL for an object in the public Filebase bucket (ADR-015).
 *
 * Used only when `FILEBASE_PUBLIC_BASE_URL` is set (the bucket is public);
 * otherwise Payload's own media route serves the file and this never runs.
 *
 * @param baseUrl Public origin of the bucket, e.g. `https://vaultifier.s3.filebase.io`
 * @param prefix  The object's folder inside the bucket (e.g. `media`)
 * @param filename The object key's file name, including any generated size suffix
 */
export function publicFileUrl({
  baseUrl,
  prefix,
  filename,
}: {
  baseUrl: string;
  prefix?: string | null;
  filename: string;
}): string {
  const origin = baseUrl.replace(/\/+$/, '');
  const key = [prefix, filename]
    .filter((part): part is string => Boolean(part))
    .join('/')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+/, '');
  return `${origin}/${key}`;
}
