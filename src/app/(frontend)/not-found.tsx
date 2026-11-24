import Link from 'next/link';

import { messages } from '@/messages';

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16 md:py-24">
      <p className="text-sm font-semibold tracking-wide text-brand-primary uppercase">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {messages.notFound.title}
      </h1>
      <p className="text-ink-muted">{messages.notFound.body}</p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-input bg-brand-primary px-5 text-sm font-semibold text-brand-primary-contrast hover:bg-ink"
      >
        {messages.notFound.home}
      </Link>
    </div>
  );
}
