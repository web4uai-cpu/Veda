import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundaryPage from './error';
import NotFound from './not-found';

describe('error.tsx', () => {
  it('renders the error message and retries via reset', () => {
    const reset = vi.fn();
    render(<ErrorBoundaryPage error={new Error('boom')} reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('offers a link home', () => {
    render(<ErrorBoundaryPage error={new Error('boom')} reset={() => {}} />);
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });
});

describe('not-found.tsx', () => {
  it('renders a 404 message with a home link', () => {
    render(<NotFound />);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
  });
});
