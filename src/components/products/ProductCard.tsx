import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { priceFor } from '@/lib/pricing';
import { messages } from '@/messages';
import type { Product } from '@/payload-types';

import { SiteImage } from '../blocks/SiteImage';

/**
 * One product card for the `/products` index. The "from" price is the
 * cheapest pack after any active discount, computed by the shared pricing
 * function — cards never do their own arithmetic.
 */
export function ProductCard({ product }: { product: Product }) {
  const now = new Date();
  const prices = (product.packSizes ?? []).map(
    (pack) => priceFor(pack.rate, product.discount, now).finalRate,
  );
  const fromPrice = prices.length > 0 ? Math.min(...prices) : null;
  const image = (product.images ?? []).flatMap((entry) =>
    typeof entry.image === 'object' && entry.image !== null ? [entry.image] : [],
  )[0];

  return (
    <li className="h-full">
      <Link
        href={`/products/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface text-ink transition-colors hover:border-brand-primary"
      >
        <div className="relative aspect-square overflow-hidden border-b border-line bg-surface-alt">
          {image ? (
            <SiteImage
              image={image}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 300px"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-xs text-ink-muted">
              {messages.productsPage.photoPending}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="content-text text-lg leading-snug text-ink">{product.title}</h3>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            {fromPrice !== null ? (
              <span className="tabular text-sm text-brand-primary">
                {messages.productsPage.fromPrice.replace(
                  '{price}',
                  fromPrice.toLocaleString('en-US'),
                )}
              </span>
            ) : (
              <span />
            )}
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </Link>
    </li>
  );
}
