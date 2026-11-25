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
      <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {messages.productsPage.indexTitle}
      </h1>
      <p className="content-text mt-4 max-w-3xl text-ink-muted">
        {messages.productsPage.indexIntro}
      </p>

      {products.length === 0 ? (
        <p className="mt-8 text-ink-muted">{messages.productsPage.indexEmpty}</p>
      ) : (
        <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </Section>
  );
}
