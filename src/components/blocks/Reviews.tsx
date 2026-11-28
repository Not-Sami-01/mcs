import { Star } from 'lucide-react';

import type { Review } from '@/payload-types';
import { messages } from '@/messages';

import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

function isReview(value: unknown): value is Review {
  return typeof value === 'object' && value !== null && 'reviewerName' in value;
}

/**
 * Verified customer reviews (CP-5.5). The collection already hides unverified
 * reviews from anonymous reads; this second filter keeps a staff-selected but
 * unverified review out of the published HTML and hides the whole section when
 * nothing verified remains.
 */
export function Reviews({ block }: { block: BlockOf<'reviews'> }) {
  const reviews = (block.reviews ?? [])
    .filter(isReview)
    .filter((review) => review.verified === true);

  if (reviews.length === 0) return null;

  return (
    <Section tone="alt" label={messages.blocks.reviewsLabel}>
      <SectionHeading>{block.headline}</SectionHeading>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => {
          const rating = Math.min(5, Math.max(1, Math.round(review.rating ?? 0)));

          return (
            <figure
              key={review.id}
              className="flex h-full flex-col rounded-card border border-line bg-surface p-5"
            >
              <div
                aria-label={messages.blocks.ratingOutOf.replace('{rating}', String(review.rating))}
                className="flex gap-0.5 text-brand-primary"
                role="img"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    aria-hidden="true"
                    fill={index < rating ? 'currentColor' : 'none'}
                    key={index}
                    size={16}
                    strokeWidth={1.6}
                  />
                ))}
              </div>

              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink">
                {review.text}
              </blockquote>

              <figcaption className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
                <span className="font-medium text-ink">{review.reviewerName}</span>
                {review.city ? ` · ${review.city}` : null}
                {review.source
                  ? ` · ${messages.blocks.reviewsVia.replace(
                      '{source}',
                      review.source.charAt(0).toUpperCase() + review.source.slice(1),
                    )}`
                  : null}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Section>
  );
}
