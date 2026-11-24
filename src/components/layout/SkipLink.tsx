import { messages } from '@/messages';

/** First focusable element on every public page (docs/DESIGNS.md §9). */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-input bg-surface px-4 py-2 text-sm font-medium text-ink shadow-card focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[80]"
    >
      {messages.common.skipToContent}
    </a>
  );
}
