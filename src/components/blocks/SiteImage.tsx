import type { Media } from '@/payload-types';

export type SiteImageRef = Media | number | null | undefined;

function variantSet(image: Media): string {
  return [image.sizes?.thumb, image.sizes?.card, image.sizes?.hero]
    .flatMap((size) => (size?.url && size.width ? [`${size.url} ${size.width}w`] : []))
    .join(', ');
}

function avifSet(image: Media): string {
  return [image.sizes?.['card-avif'], image.sizes?.['hero-avif']]
    .flatMap((size) => (size?.url && size.width ? [`${size.url} ${size.width}w`] : []))
    .join(', ');
}

/**
 * Public CMS image. Uses the WebP/AVIF variants generated at upload time rather
 * than Next's optimizer (ADR-015: the optimizer is deliberately out of this
 * path; preview URLs carry `?prefix=media`, gotcha 23). Alt text is required by
 * the media collection, so it is always present.
 */
export function SiteImage({
  image,
  sizes = '(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 600px',
  className = '',
  priority = false,
}: {
  image: SiteImageRef;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!image || typeof image === 'number' || !image.url) return null;

  const webp = variantSet(image);
  const avif = avifSet(image);

  return (
    <picture>
      {avif ? <source type="image/avif" srcSet={avif} sizes={sizes} /> : null}
      {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
      <img
        src={image.url}
        srcSet={webp || undefined}
        sizes={webp ? sizes : undefined}
        alt={image.alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
