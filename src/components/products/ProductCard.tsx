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
        className="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5 text-ink transition-colors hover:border-brand-primary focus-visible:outline-brand-primary"
      >
        {image ? (
          <SiteImage
            image={image}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 300px"
            className="aspect-square w-full rounded-card object-cover"
          />
        ) : null}
        <div className="flex flex-1 flex-col justify-between gap-3">
          <h3 className="content-text text-lg font-semibold">{product.title}</h3>
          <div className="flex items-baseline justify-between gap-3">
            {fromPrice !== null ? (
              <span className="text-sm font-semibold text-brand-primary">
                {messages.productsPage.fromPrice.replace(
                  '{price}',
                  fromPrice.toLocaleString('en-US'),
                )}
              </span>
            ) : null}
            <span className="text-sm font-semibold text-brand-primary">
              {messages.productsPage.viewProduct}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
