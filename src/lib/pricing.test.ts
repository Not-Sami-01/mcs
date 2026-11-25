import { describe, expect, it } from 'vitest';

import {
  discountProblem,
  discountSnapshot,
  isDiscountActive,
  lowestRate,
  priceFor,
  todayInKarachi,
} from './pricing';

describe('pricing in Asia/Karachi', () => {
  it('formats the Karachi business date, not the server date', () => {
    // 20:00 UTC on 31 December is 01:00 on 1 January in Karachi (UTC+5).
    expect(todayInKarachi(new Date('2026-12-31T20:00:00.000Z'))).toBe('2027-01-01');
    expect(todayInKarachi(new Date('2026-12-31T18:00:00.000Z'))).toBe('2026-12-31');
  });

  it('applies a percent discount only inside the inclusive Karachi window', () => {
    const discount = { type: 'percent', value: 20, startsAt: '2027-01-01', endsAt: '2027-01-10' };

    expect(isDiscountActive(discount, new Date('2026-12-31T18:59:00.000Z'))).toBe(false);
    expect(isDiscountActive(discount, new Date('2026-12-31T19:00:00.000Z'))).toBe(true);
    expect(isDiscountActive(discount, new Date('2027-01-10T18:59:00.000Z'))).toBe(true);
    expect(isDiscountActive(discount, new Date('2027-01-10T19:00:00.000Z'))).toBe(false);
  });

  it('treats a missing start or end as open-ended', () => {
    expect(isDiscountActive({ type: 'fixed', value: 100 })).toBe(true);
    expect(isDiscountActive({ type: 'fixed', value: 100, startsAt: '2020-01-01' })).toBe(true);
    expect(isDiscountActive({ type: 'fixed', value: 100, endsAt: '2020-01-01' })).toBe(false);
  });

  it('accepts full ISO timestamps in date fields', () => {
    expect(
      isDiscountActive(
        { type: 'percent', value: 10, startsAt: '2026-11-01T00:00:00.000Z' },
        new Date('2026-11-26T10:00:00.000Z'),
      ),
    ).toBe(true);
  });

  it('ignores unusable discounts', () => {
    expect(isDiscountActive(null)).toBe(false);
    expect(isDiscountActive({ type: 'percent', value: 0 })).toBe(false);
    expect(isDiscountActive({ type: 'percent', value: 95 })).toBe(false);
    expect(isDiscountActive({ type: 'fixed', value: -5 })).toBe(false);
    expect(isDiscountActive({ type: 'other', value: 5 })).toBe(false);
  });
});

describe('priceFor', () => {
  const now = new Date('2026-11-26T10:00:00.000Z');

  it('returns the plain rate with no discount', () => {
    expect(priceFor(1200, null, now)).toEqual({
      rate: 1200,
      finalRate: 1200,
      discountAmount: 0,
      discountActive: false,
    });
  });

  it('rounds a percent discount to whole rupees', () => {
    expect(priceFor(999, { type: 'percent', value: 15 }, now)).toEqual({
      rate: 999,
      finalRate: 849,
      discountAmount: 150,
      discountActive: true,
    });
  });

  it('subtracts a fixed discount', () => {
    expect(priceFor(2500, { type: 'fixed', value: 300 }, now).finalRate).toBe(2200);
  });

  it('never goes below zero', () => {
    expect(priceFor(200, { type: 'fixed', value: 500 }, now)).toEqual({
      rate: 200,
      finalRate: 0,
      discountAmount: 200,
      discountActive: true,
    });
  });

  it('ignores an expired discount', () => {
    const expired = { type: 'percent', value: 25, endsAt: '2026-10-01' };
    expect(priceFor(1000, expired, now).finalRate).toBe(1000);
  });
});

describe('discount validation', () => {
  it('accepts absent, valid percent and valid fixed discounts', () => {
    expect(discountProblem(null, [500])).toBeNull();
    expect(discountProblem({ type: 'percent', value: 45 }, [500])).toBeNull();
    expect(discountProblem({ type: 'fixed', value: 100 }, [500, 900])).toBeNull();
  });

  it('rejects percent values outside 1–90', () => {
    expect(discountProblem({ type: 'percent', value: 0 }, [500])).toBe('percent_range');
    expect(discountProblem({ type: 'percent', value: 91 }, [500])).toBe('percent_range');
  });

  it('rejects a fixed discount that is not below the cheapest pack', () => {
    expect(discountProblem({ type: 'fixed', value: 500 }, [500, 900])).toBe('fixed_not_below_rate');
    expect(discountProblem({ type: 'fixed', value: 0 }, [500])).toBe('fixed_not_positive');
  });

  it('rejects an end date before the start date', () => {
    expect(
      discountProblem(
        { type: 'percent', value: 10, startsAt: '2026-12-10', endsAt: '2026-12-01' },
        [500],
      ),
    ).toBe('end_before_start');
  });

  it('allows a one-day window and finds the lowest rate', () => {
    expect(
      discountProblem(
        { type: 'percent', value: 10, startsAt: '2026-12-10', endsAt: '2026-12-10' },
        [500],
      ),
    ).toBeNull();
    expect(lowestRate([900, 500, 700])).toBe(500);
    expect(lowestRate([])).toBeNull();
  });
});

describe('discountSnapshot', () => {
  it('normalises a saved discount for history comparison', () => {
    expect(
      discountSnapshot({
        type: 'percent',
        value: 20,
        startsAt: '2026-12-01T00:00:00.000Z',
        endsAt: '2026-12-31',
      }),
    ).toEqual({ type: 'percent', value: 20, startsAt: '2026-12-01', endsAt: '2026-12-31' });
    expect(discountSnapshot({ type: 'percent', value: null })).toBeNull();
    expect(discountSnapshot(null)).toBeNull();
  });
});
