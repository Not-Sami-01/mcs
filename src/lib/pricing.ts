/**
 * The one pricing function (docs/DATABASE.md §1, ADR-011, ADR-013).
 *
 * Money is stored as integer PKR rupees. A product's pack sizes each carry a
 * rate; at most one discount (percent or fixed) applies to every pack of that
 * product while its date window is open. Windows are inclusive dates and are
 * evaluated in **Asia/Karachi**, never the server's timezone: a sale that
 * starts "1 January" starts at midnight in Karachi, not in UTC.
 *
 * Nothing in the public UI may compute a price on its own — the product page,
 * the quote basket and the CSV export all call `priceFor`.
 */

/** Business timezone for money rules (docs/DATABASE.md §1). */
export const PRICING_TIME_ZONE = 'Asia/Karachi';

export type DiscountType = 'percent' | 'fixed';

export type DiscountInput = {
  type?: DiscountType | string | null;
  value?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type PackPrice = {
  /** The stored rate in whole rupees. */
  rate: number;
  /** What the customer pays after an active discount. */
  finalRate: number;
  /** Whole rupees removed; 0 when no discount is active. */
  discountAmount: number;
  discountActive: boolean;
};

export type DiscountProblem =
  'percent_range' | 'fixed_not_positive' | 'fixed_not_below_rate' | 'end_before_start';

/** `YYYY-MM-DD` for a moment in the business timezone (en-CA formats ISO-like). */
export function todayInKarachi(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PRICING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Payload date fields may be `YYYY-MM-DD` or a full ISO timestamp; compare dates. */
function dateOnly(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return null;
  return trimmed.slice(0, 10);
}

function usableType(type: DiscountInput['type']): DiscountType | null {
  return type === 'percent' || type === 'fixed' ? type : null;
}

/**
 * A discount is active only when its type and value are usable and today
 * (Karachi) is inside the inclusive start/end window. A missing start or end
 * leaves that side open.
 */
export function isDiscountActive(
  discount: DiscountInput | null | undefined,
  now: Date = new Date(),
): boolean {
  const type = usableType(discount?.type);
  const value = discount?.value;
  if (!type || typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return false;
  if (type === 'percent' && value > 90) return false;

  const today = todayInKarachi(now);
  const start = dateOnly(discount?.startsAt);
  const end = dateOnly(discount?.endsAt);

  if (start && today < start) return false;
  if (end && today > end) return false;

  return true;
}

/**
 * Price one pack. Percent discounts round to the nearest rupee; a fixed
 * discount never takes a pack below zero even if stored data is inconsistent
 * (the collection validates fixed < lowest rate, this is the last line of
 * defence).
 */
export function priceFor(
  rate: number,
  discount: DiscountInput | null | undefined,
  now: Date = new Date(),
): PackPrice {
  const safeRate = Number.isFinite(rate) ? Math.max(0, Math.round(rate)) : 0;

  if (!isDiscountActive(discount, now)) {
    return { rate: safeRate, finalRate: safeRate, discountAmount: 0, discountActive: false };
  }

  const value = discount!.value as number;
  const raw = discount!.type === 'percent' ? (safeRate * value) / 100 : value;
  const discountAmount = Math.min(safeRate, Math.max(0, Math.round(raw)));

  return {
    rate: safeRate,
    finalRate: safeRate - discountAmount,
    discountAmount,
    discountActive: discountAmount > 0,
  };
}

/** The cheapest stored rate, used to check a fixed discount stays below it. */
export function lowestRate(rates: readonly number[]): number | null {
  const usable = rates.filter((rate) => Number.isFinite(rate) && rate >= 0);
  return usable.length > 0 ? Math.min(...usable) : null;
}

/**
 * Validation shared by the collection hook and tests. Returns `null` when the
 * discount is usable or absent; otherwise a reason key the collection maps to
 * a readable message. An empty `packRates` list cannot check a fixed discount.
 */
export function discountProblem(
  discount: DiscountInput | null | undefined,
  packRates: readonly number[],
): DiscountProblem | null {
  const type = usableType(discount?.type);
  const value = discount?.value;
  if (!type || value === null || value === undefined) return null;

  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return type === 'percent' ? 'percent_range' : 'fixed_not_positive';
  }

  if (type === 'percent') {
    if (value > 90) return 'percent_range';
  } else {
    const lowest = lowestRate(packRates);
    if (lowest !== null && value >= lowest) return 'fixed_not_below_rate';
  }

  const start = dateOnly(discount?.startsAt);
  const end = dateOnly(discount?.endsAt);
  if (start && end && end < start) return 'end_before_start';

  return null;
}

/** Readable server messages for `discountProblem` keys. */
export const DISCOUNT_PROBLEMS: Record<DiscountProblem, string> = {
  percent_range: 'A percent discount must be between 1 and 90.',
  fixed_not_positive: 'A fixed discount must be a positive number of rupees.',
  fixed_not_below_rate: 'A fixed discount must be lower than the cheapest pack rate.',
  end_before_start: 'The discount end date cannot be before its start date.',
};

/** Discount groups as stored on a product, for history comparisons. */
export function discountSnapshot(
  discount: DiscountInput | null | undefined,
): Record<string, string | number> | null {
  const type = usableType(discount?.type);
  const value = discount?.value;
  if (!type || typeof value !== 'number') return null;

  return {
    type,
    value,
    startsAt: dateOnly(discount?.startsAt) ?? '',
    endsAt: dateOnly(discount?.endsAt) ?? '',
  };
}
