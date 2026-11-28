'use client';

import { messages } from '@/messages';

export default function FrontendError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16 md:py-24">
      <h1 className="text-3xl font-medium text-ink md:text-4xl">{messages.error.title}</h1>
      <p className="text-ink-muted">{messages.error.body}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-input bg-brand-primary px-5 text-sm font-medium text-brand-primary-contrast hover:bg-ink"
      >
        {messages.error.retry}
      </button>
    </div>
  );
}
