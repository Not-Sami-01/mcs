'use client';

import Link from 'next/link';
import { useState } from 'react';

import { messages } from '@/messages';

import { WhatsAppIcon } from '../layout/icons';

export type StockStatus = 'in_stock' | 'low' | 'out' | 'preorder';

export type PackOption = {
  key: string;
  label: string;
  stockStatus: StockStatus;
  rate: number;
  finalRate: number;
  discountAmount: number;
  discountActive: boolean;
  /** WhatsApp order link with this pack prefilled; null when no number is saved. */
  orderHref: string | null;
  /** Quote form link carrying the product and pack. */
  quoteHref: string;
};

const STOCK_LABELS: Record<StockStatus, string> = {
  in_stock: messages.productsPage.stockInStock,
  low: messages.productsPage.stockLow,
  out: messages.productsPage.stockOut,
  preorder: messages.productsPage.stockPreorder,
};

const rupees = (value: number) => `Rs ${value.toLocaleString('en-US')}`;

/**
 * Pack selector, live price and the two ordering actions (CP-5.3). Prices are
 * computed on the server by `src/lib/pricing.ts` and passed in; this component
 * only picks which pack to show, so it never re-implements discount rules.
 */
export function ProductPurchase({
  packs,
  discount,
}: {
  packs: PackOption[];
  discount: { type: 'percent' | 'fixed'; value: number } | null;
}) {
  const [selectedKey, setSelectedKey] = useState(
    () => (packs.find((pack) => pack.stockStatus !== 'out') ?? packs[0])?.key ?? '',
  );
  const selected = packs.find((pack) => pack.key === selectedKey) ?? packs[0];

  if (!selected) return null;

  const discountLabel = !selected.discountActive
    ? null
    : discount?.type === 'fixed'
      ? messages.productsPage.discountAmount.replace(
          '{amount}',
          selected.discountAmount.toLocaleString('en-US'),
        )
      : messages.productsPage.discountPercent.replace('{value}', String(discount?.value ?? ''));

  return (
    <div className="mt-6">
      {packs.length > 1 ? (
        <fieldset>
          <legend className="text-sm font-medium text-ink">{messages.productsPage.packSize}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {packs.map((pack) => (
              <label
                key={pack.key}
                className={`flex cursor-pointer items-start gap-3 rounded-input border p-3 text-sm transition-colors ${
                  pack.key === selected.key ? 'border-brand-primary' : 'border-line'
                }`}
              >
                <input
                  type="radio"
                  name="pack-size"
                  value={pack.key}
                  checked={pack.key === selected.key}
                  onChange={() => setSelectedKey(pack.key)}
                  className="mt-1 accent-brand-primary"
                />
                <span className="flex flex-col">
                  <span className="font-medium text-ink">{pack.label}</span>
                  <span className="text-ink-muted">
                    {pack.discountActive ? rupees(pack.finalRate) : rupees(pack.rate)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-5">
        <p className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-medium text-brand-primary">
            {rupees(selected.finalRate)}
          </span>
          {selected.discountActive ? (
            <>
              <s className="text-sm text-ink-muted">{rupees(selected.rate)}</s>
              <span className="rounded-input bg-surface-alt px-2 py-1 text-xs font-medium text-brand-primary">
                {discountLabel}
              </span>
            </>
          ) : null}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          {messages.productsPage.stock}:{' '}
          <span
            className={selected.stockStatus === 'out' ? 'text-ink-muted' : 'font-medium text-ink'}
          >
            {STOCK_LABELS[selected.stockStatus]}
          </span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {selected.orderHref ? (
          <a
            href={selected.orderHref}
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-input bg-whatsapp px-5 text-sm font-medium text-ink hover:bg-brand-primary hover:text-brand-primary-contrast"
          >
            <WhatsAppIcon />
            {messages.productsPage.orderOnWhatsApp}
          </a>
        ) : null}
        <Link
          href={selected.quoteHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-input border border-line px-5 text-sm font-medium text-ink hover:border-brand-primary hover:text-brand-primary"
        >
          {messages.productsPage.addToQuote}
        </Link>
      </div>
    </div>
  );
}
