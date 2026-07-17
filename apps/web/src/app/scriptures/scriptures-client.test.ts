import { describe, it, expect } from 'vitest';
import { buildDisplayGroups } from './scriptures-client';
import type { Scripture } from '@/lib/api';

function makeScripture(overrides: Partial<Scripture>): Scripture {
  return {
    id: 'scp_test',
    slug: 'test',
    name: 'Test',
    sanskrit_name: null,
    category: 'veda',
    language: 'sanskrit',
    period: null,
    description: null,
    is_canonical: true,
    metadata: {},
    created_at: '2026-01-01T00:00:00Z',
    chapter_count: 0,
    verse_count: 0,
    ...overrides,
  };
}

describe('buildDisplayGroups', () => {
  const scriptures = [
    makeScripture({ slug: 'rigveda', name: 'Rigveda', category: 'veda' }),
    makeScripture({ slug: 'gita', name: 'Bhagavad Gita', category: 'gita' }),
    makeScripture({ slug: 'ramayana', name: 'Ramayana', category: 'ramayana' }),
    makeScripture({ slug: 'isha', name: 'Isha Upanishad', category: 'upanishad' }),
  ];

  it('groups by tradition and merges gita/ramayana/mahabharata into Itihasa', () => {
    const groups = buildDisplayGroups(scriptures, 'all');
    const labels = groups.map((g) => g.key);
    expect(labels).toEqual(['veda', 'upanishad', 'itihasa']);

    const itihasa = groups.find((g) => g.key === 'itihasa')!;
    expect(itihasa.items.map((s) => s.slug)).toEqual(['gita', 'ramayana']);
  });

  it('filters to a single group', () => {
    const groups = buildDisplayGroups(scriptures, 'veda');
    expect(groups).toHaveLength(1);
    expect(groups[0]!.items[0]!.name).toBe('Rigveda');
  });

  it('drops empty groups', () => {
    const groups = buildDisplayGroups(scriptures, 'purana');
    expect(groups).toHaveLength(0);
  });
});
