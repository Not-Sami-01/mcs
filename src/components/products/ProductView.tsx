import type { SiteChrome } from '@/cms/site-chrome';
import { isDiscountActive, priceFor } from '@/lib/pricing';
import { whatsappHref } from '@/lib/links';
import { messages } from '@/messages';
import type { Media, Product } from '@/payload-types';

import { Section, SectionHeading } from '../blocks/Section';
import { SiteImage } from '../blocks/SiteImage';
import { ProductPurchase, type PackOption, type StockStatus } from './ProductPurchase';

/**
 * Product detail (docs/CONTENT.md §7.3): images, price, an active-only
 * discount, pack selector, stock status, description, how to use, safety
 * information and documents, Order on WhatsApp and Add to Quote.
 *
 * Prices are computed here with `src/lib/pricing.ts`; the page is static with a
 * five-minute backstop, and product saves revalidate the tag, so a discount
 * window can be at most one revalidation late.
 */
export function ProductView({ product, chrome }: { product: Product; chrome: SiteChrome }) {
  const now = new Date();
  const images = (product.images ?? []).flatMap((entry) =>
    typeof entry.image === 'object' && entry.image !== null ? [entry.image] : [],
  );
  const documents = (product.safetyDocuments ?? []).flatMap((entry) =>
    typeof entry === 'object' && entry !== null && 'url' in entry ? [entry as Media] : [],
  );

  const paragraphs = (items: Product['description']) =>
    (items ?? []).flatMap((entry) => (entry.body?.trim() ? [entry.body] : []));

  const discountType =
    product.discount?.type === 'fixed'
      ? ('fixed' as const)
      : product.discount?.type === 'percent'
        ? ('percent' as const)
        : null;
  const discountValue = typeof product.discount?.value === 'number' ? product.discount.value : null;
  const discount =
    discountType && discountValue !== null && isDiscountActive(product.discount, now)
      ? { type: discountType, value: discountValue }
      : null;

  const pageUrl = `${chrome.siteUrl}/products/${product.slug}`;
  const packs: PackOption[] = (product.packSizes ?? []).map((pack, index) => {
    const price = priceFor(pack.rate, product.discount, now);
    const key = pack.sku?.trim() || pack.label || `pack-${index + 1}`;
    const message = messages.whatsapp.order
      .replace('{item}', `${product.title} (${pack.label})`)
      .replace('{url}', pageUrl);

    return {
      key,
      label: pack.label,
      stockStatus: (pack.stockStatus ?? 'out') as StockStatus,
      rate: price.rate,
      finalRate: price.finalRate,
      discountAmount: price.discountAmount,
      discountActive: price.discountActive,
      orderHref: whatsappHref(chrome.whatsappNumber, message),
      quoteHref: `/get-a-quote?product=${encodeURIComponent(product.slug)}${
        pack.sku?.trim() ? `&pack=${encodeURIComponent(pack.sku.trim())}` : ''
      }`,
    };
  });

  const description = paragraphs(product.description);
  const howToUse = paragraphs(product.howToUse);
  const safetyInfo = paragraphs(product.safetyInfo);
  const fromPrice = packs.length > 0 ? Math.min(...packs.map((pack) => pack.finalRate)) : null;

  return (
    <>
      <Section>
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {images.length > 0 ? (
            <div className="grid gap-3 overflow-hidden rounded-panel border border-line bg-surface-alt">
              {images.map((image, index) => (
                <SiteImage
                  key={image.id ?? index}
                  image={image}
                  priority={index === 0}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="w-full object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-panel border border-line bg-surface-alt p-6 text-center text-sm text-ink-muted">
              {messages.productsPage.photoPending}
            </div>
          )}

          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-ink-muted">
              <span aria-hidden="true" className="h-2 w-2 bg-brand-accent" />
              Product
            </p>
            <h1 className="content-text mt-4 text-[2.4rem] leading-[1.1] text-ink md:text-5xl">
              {product.title}
            </h1>
            {fromPrice !== null && packs.length > 1 ? (
              <p className="mt-2 text-sm text-ink-muted">
                {messages.productsPage.fromPrice.replace(
                  '{price}',
                  fromPrice.toLocaleString('en-US'),
                )}
              </p>
            ) : null}

            <ProductPurchase packs={packs} discount={discount} />
          </div>
        </div>
      </Section>

      {description.length > 0 ? (
        <Section tone="alt">
          <SectionHeading>{messages.productsPage.description}</SectionHeading>
          <div className="mt-4 max-w-3xl space-y-3">
            {description.map((paragraph, index) => (
              <p key={index} className="content-text text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </Section>
      ) : null}

      {howToUse.length > 0 ? (
        <Section>
          <SectionHeading>{messages.productsPage.howToUse}</SectionHeading>
          <ol className="mt-4 max-w-3xl list-decimal space-y-3 ps-5">
            {howToUse.map((paragraph, index) => (
              <li key={index} className="content-text text-ink-muted">
                {paragraph}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {safetyInfo.length > 0 || documents.length > 0 ? (
        <Section tone="alt">
          <SectionHeading>{messages.productsPage.safetyInfo}</SectionHeading>
          {safetyInfo.length > 0 ? (
            <div className="mt-4 max-w-3xl space-y-3">
              {safetyInfo.map((paragraph, index) => (
                <p key={index} className="content-text text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {documents.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-ink">
                {messages.productsPage.safetyDocuments}
              </h3>
              <ul role="list" className="mt-3 flex flex-wrap gap-2">
                {documents.map((document) =>
                  document.url ? (
                    <li key={document.id}>
                      <a
                        href={document.url}
                        rel="noopener noreferrer"
                        className="inline-block rounded-input border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-brand-primary"
                      >
                        {document.filename ?? messages.productsPage.viewDocument}
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}
