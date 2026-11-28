import { RichText } from '@payloadcms/richtext-lexical/react';
import Link from 'next/link';

import type { SiteChrome } from '@/cms/site-chrome';
import { messages } from '@/messages';
import type { Location, Post, Service } from '@/payload-types';

import { BlockAction, resolveAction } from '../blocks/BlockAction';
import { Section, SectionHeading } from '../blocks/Section';
import { SiteImage } from '../blocks/SiteImage';

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(date);
}

/** One Pest Library article (CP-5.5): H1, long-form body, related pages, CTA. */
export function PostView({ post, chrome }: { post: Post; chrome: SiteChrome }) {
  const date = formatDate(post.publishedAt);
  const relatedServices = (post.relatedServices ?? []).flatMap((entry) =>
    typeof entry === 'object' && entry !== null && 'title' in entry ? [entry as Service] : [],
  );
  const relatedLocations = (post.relatedLocations ?? []).flatMap((entry) =>
    typeof entry === 'object' && entry !== null && 'name' in entry ? [entry as Location] : [],
  );

  const inspection = resolveAction(
    { label: messages.blocks.startInspection, kind: 'inspection', href: '/free-inspection' },
    chrome,
  );

  return (
    <>
      <Section>
        <article className="max-w-3xl">
          <p className="text-sm font-medium text-ink-muted">{messages.postsPage.indexTitle}</p>
          <h1 className="content-text mt-4 text-[2.4rem] leading-[1.1] text-ink md:text-5xl">
            {post.title}
          </h1>
          {date ? (
            <p className="mt-3 text-sm text-ink-muted">
              {messages.postsPage.publishedOn.replace('{date}', date)}
            </p>
          ) : null}
          <p className="content-text mt-4 text-lg text-ink-muted">{post.excerpt}</p>

          {post.coverImage && typeof post.coverImage === 'object' ? (
            <div className="mt-6">
              <SiteImage
                image={post.coverImage}
                priority
                sizes="(max-width: 767px) 100vw, 768px"
                className="aspect-[16/9] w-full rounded-panel object-cover"
              />
            </div>
          ) : null}

          <div className="article-body mt-8 text-ink">
            <RichText data={post.body} />
          </div>

          {relatedServices.length > 0 ? (
            <nav aria-label={messages.postsPage.relatedServices} className="mt-10">
              <h2 className="text-lg font-medium text-ink">{messages.postsPage.relatedServices}</h2>
              <ul role="list" className="mt-3 flex flex-wrap gap-2">
                {relatedServices.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-block rounded-input border border-line px-4 py-2 text-sm font-medium text-brand-primary hover:border-brand-primary"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {relatedLocations.length > 0 ? (
            <nav aria-label={messages.postsPage.relatedLocations} className="mt-8">
              <h2 className="text-lg font-medium text-ink">
                {messages.postsPage.relatedLocations}
              </h2>
              <ul role="list" className="mt-3 flex flex-wrap gap-2">
                {relatedLocations.map((location) => (
                  <li key={location.id}>
                    <Link
                      href={
                        location.type === 'city'
                          ? `/locations/${location.slug}`
                          : `/locations/${typeof location.parent === 'object' && location.parent ? location.parent.slug : ''}/${location.slug}`
                      }
                      className="inline-block rounded-input border border-line px-4 py-2 text-sm font-medium text-brand-primary hover:border-brand-primary"
                    >
                      {location.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <Link
            href="/pest-library"
            className="mt-10 inline-block text-sm font-medium text-brand-primary hover:underline"
          >
            {messages.postsPage.backToLibrary}
          </Link>
        </article>
      </Section>

      <Section tone="alt">
        <SectionHeading>{messages.postsPage.ctaTitle}</SectionHeading>
        <p className="content-text mt-4 max-w-2xl text-ink-muted">{messages.postsPage.ctaBody}</p>
        <div className="mt-6">
          <BlockAction action={inspection} variant="primary" />
        </div>
      </Section>
    </>
  );
}
