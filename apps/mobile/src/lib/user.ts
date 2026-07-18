import type { User } from 'firebase/auth';

/**
 * A human name for the account, never an email address.
 *
 * Firebase leaves `displayName` null for email/password signups, and the old
 * `displayName ?? email` fallback meant those users saw their email rendered as
 * both the heading and the caption beneath it. Deriving a name from the email
 * local-part keeps the heading a name and the email shown exactly once.
 */
export function displayNameFor(user: Pick<User, 'displayName' | 'email'> | null): string {
  if (!user) return 'Seeker';
  if (user.displayName?.trim()) return user.displayName.trim();

  const local = user.email?.split('@')[0];
  if (!local) return 'Seeker';

  // "ravi.kumar_92" -> "Ravi Kumar" — digits and separators are noise, not a name.
  const words = local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));

  return words.length ? words.join(' ') : 'Seeker';
}
