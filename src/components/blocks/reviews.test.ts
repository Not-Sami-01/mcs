import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Reviews } from './Reviews';

const review = (overrides: Record<string, unknown>) => ({
  id: 1,
  reviewerName: 'Ayesha',
  city: 'Lahore',
  text: 'Quick and tidy service.',
  rating: 5,
  source: 'google',
  reviewDate: '2026-11-01T00:00:00.000Z',
  permissionConfirmed: true,
  verified: true,
  updatedAt: '',
  createdAt: '',
  ...overrides,
});

const block = (reviews: unknown[]) =>
  ({ blockType: 'reviews', headline: 'What customers say', reviews }) as never;

describe('Reviews block', () => {
  it('renders verified reviews only', () => {
    const html = renderToStaticMarkup(
      createElement(Reviews, {
        block: block([
          review({ id: 1, reviewerName: 'Ayesha' }),
          review({ id: 2, reviewerName: 'Hidden person', verified: false }),
        ]),
      }),
    );

    expect(html).toContain('What customers say');
    expect(html).toContain('Ayesha');
    expect(html).not.toContain('Hidden person');
    expect(html).toContain('Rated 5 out of 5');
  });

  it('renders nothing when no verified reviews remain', () => {
    const html = renderToStaticMarkup(
      createElement(Reviews, {
        block: block([review({ id: 3, verified: false })]),
      }),
    );

    expect(html).toBe('');
  });
});
