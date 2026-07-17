'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">🕉️</p>
      <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-[hsl(var(--muted-foreground))]">
        An unexpected error occurred while rendering this page. You can try again, or return home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--accent))]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
