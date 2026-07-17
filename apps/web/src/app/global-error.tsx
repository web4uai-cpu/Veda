'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#080808',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <h2>Something went wrong</h2>
        <p style={{ color: '#94a3b8', maxWidth: '28rem', fontSize: '0.875rem' }}>
          VEDA hit an unexpected error. {error.digest ? `Reference: ${error.digest}` : ''}
        </p>
        <button
          onClick={reset}
          style={{
            background: '#C97A24',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
