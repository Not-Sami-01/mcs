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
        className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-surface text-ink transition duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-[var(--shadow-lift)] focus-visible:outline-brand-primary"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-alt">
          {image ? (
            <SiteImage
              image={image}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 300px"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(120%_120%_at_20%_0%,#14563d,var(--brand-deep))] text-3xl font-semibold tracking-tight text-brand-accent">
              MCS
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-5">
          <h3 className="content-text text-lg font-semibold leading-snug">{product.title}</h3>
          <div className="flex items-center justify-between gap-3">
            {fromPrice !== null ? (
              <span className="text-sm font-semibold text-brand-primary">
                {messages.productsPage.fromPrice.replace(
                  '{price}',
                  fromPrice.toLocaleString('en-US'),
                )}
              </span>
            ) : (
              <span />
            )}
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-brand-primary transition group-hover:bg-brand-accent group-hover:text-brand-accent-ink"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
