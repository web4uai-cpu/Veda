import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">🪔</p>
      <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Page not found</h2>
      <p className="max-w-md text-sm text-[hsl(var(--muted-foreground))]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
      >
        Return home
      </Link>
    </div>
  );
}
