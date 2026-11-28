import type { Metadata } from 'next';

import { getCachedPublishedProducts, getCachedSiteChrome } from '@/cms/cache';
import { Section } from '@/components/blocks/Section';
import { ProductCard } from '@/components/products/ProductCard';
import { messages } from '@/messages';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getCachedSiteChrome();

  return {
    title: `${messages.productsPage.indexTitle} | ${chrome.companyName}`,
    description: messages.productsPage.indexIntro,
  };
}

/** Products index: every published product as a card (CP-5.3). */
export default async function ProductsIndexPage() {
  const products = await getCachedPublishedProducts();

  return (
    <Section>
      <div className="max-w-3xl">
        <h1 className="text-[2.4rem] leading-[1.1] text-ink md:text-5xl">
          {messages.productsPage.indexTitle}
        </h1>
        <p className="content-text mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
          {messages.productsPage.indexIntro}
        </p>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-ink-muted">{messages.productsPage.indexEmpty}</p>
      ) : (
        <ul role="list" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </Section>
  );
}
