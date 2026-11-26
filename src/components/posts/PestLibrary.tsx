import Link from 'next/link';

import { messages } from '@/messages';
import type { Post } from '@/payload-types';

import { Section } from '../blocks/Section';

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

/** Pest Library index (CP-5.5): every published article, newest first. */
export function PestLibrary({ posts }: { posts: Post[] }) {
  return (
    <Section>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-primary uppercase">
          Guides
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-ink md:text-5xl">
          {messages.postsPage.indexTitle}
        </h1>
        <p className="content-text mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
          {messages.postsPage.indexIntro}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-ink-muted">{messages.postsPage.indexEmpty}</p>
      ) : (
        <ul role="list" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const date = formatDate(post.publishedAt);
            return (
              <li key={post.id} className="h-full">
                <Link
                  href={`/pest-library/${post.slug}`}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[1.25rem] border border-line bg-surface p-6 text-ink transition duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-[var(--shadow-lift)] focus-visible:outline-brand-primary"
                >
                  <div>
                    <h2 className="content-text text-lg font-semibold">{post.title}</h2>
                    <p className="content-text mt-2 text-sm text-ink-muted">{post.excerpt}</p>
                  </div>
                  <div className="text-sm">
                    {date ? <p className="text-ink-muted">{date}</p> : null}
                    <span className="mt-1 inline-block font-semibold text-brand-primary">
                      {messages.postsPage.readArticle}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
