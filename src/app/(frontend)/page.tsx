import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col justify-center gap-4 px-4 py-16 md:py-24">
      <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
        Malaysian Care System
      </p>
      <h1 className="text-3xl font-semibold text-neutral-900">Website scaffold is running</h1>
      <p className="text-neutral-600">
        The public site is under construction. Content and design arrive in later checkpoints.
      </p>
      <p className="text-sm text-neutral-500">
        Staff:{' '}
        <Link className="underline underline-offset-2" href="/admin">
          open the admin panel
        </Link>
      </p>
    </div>
  );
}
