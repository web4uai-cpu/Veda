import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Text, Card, Pressable, Screen, EmptyState, Input } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { useConcepts } from '@/lib/queries';

/**
 * The curated catalogue, mirroring apps/web/src/app/explore/page.tsx exactly so
 * both surfaces present the same concepts in the same order.
 *
 * This list is the source of truth rather than the graph API: /graph/concepts is
 * not returning data, and an Explore page that renders "Could not reach VEDA"
 * is worse than one built from the same static catalogue the website ships.
 * Live data, when it is available, only enriches these rows (see `enriched`).
 */
const CATEGORIES: Array<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: Array<{ name: string; desc: string; slug: string }>;
}> = [
  {
    title: 'Core Concepts',
    icon: 'bulb-outline',
    items: [
      { name: 'Atman', desc: 'The eternal Self', slug: 'atman' },
      { name: 'Brahman', desc: 'The ultimate reality', slug: 'brahman' },
      { name: 'Dharma', desc: 'Cosmic law and duty', slug: 'dharma' },
      { name: 'Karma', desc: 'Action and consequence', slug: 'karma' },
      { name: 'Moksha', desc: 'Liberation from samsara', slug: 'moksha' },
      { name: 'Maya', desc: 'Cosmic illusion', slug: 'maya' },
    ],
  },
  {
    title: 'Yoga Paths',
    icon: 'body-outline',
    items: [
      { name: 'Karma Yoga', desc: 'Path of selfless action', slug: 'karma-yoga' },
      { name: 'Jnana Yoga', desc: 'Path of knowledge', slug: 'jnana-yoga' },
      { name: 'Bhakti Yoga', desc: 'Path of devotion', slug: 'bhakti-yoga' },
      { name: 'Raja Yoga', desc: 'Path of meditation', slug: 'raja-yoga' },
    ],
  },
  {
    title: 'Philosophical Schools',
    icon: 'library-outline',
    items: [
      { name: 'Advaita', desc: 'Non-dualism (Shankara)', slug: 'advaita' },
      {
        name: 'Vishishtadvaita',
        desc: 'Qualified non-dualism (Ramanuja)',
        slug: 'vishishtadvaita',
      },
      { name: 'Dvaita', desc: 'Dualism (Madhva)', slug: 'dvaita' },
      { name: 'Sankhya', desc: 'Enumeration philosophy', slug: 'sankhya' },
      { name: 'Nyaya', desc: 'Logic and epistemology', slug: 'nyaya' },
      { name: 'Vaisheshika', desc: 'Atomistic naturalism', slug: 'vaisheshika' },
    ],
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Optional enrichment only — the page renders fully without it.
  const conceptsQ = useConcepts();

  const bySlug = useMemo(() => {
    const map = new Map<string, { sanskrit_name: string | null; connection_count?: number }>();
    for (const c of conceptsQ.data?.concepts ?? []) {
      map.set(c.slug, { sanskrit_name: c.sanskrit_name, connection_count: c.connection_count });
    }
    return map;
  }, [conceptsQ.data]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <Screen>
      <ScreenHeader title="Explore" subtitle="Concepts, paths & schools" />

      <View style={styles.search}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search concepts, e.g. dharma…"
        />
      </View>

      {groups.length === 0 ? (
        <EmptyState emoji="🔍" title={`Nothing matches “${search}”`} />
      ) : (
        groups.map((category) => (
          <View key={category.title} style={styles.section}>
            <View style={styles.sectionHead}>
              <Ionicons name={category.icon} size={16} color={theme.colors.primary} />
              <Text variant="label">{category.title}</Text>
            </View>

            <View style={styles.list}>
              {category.items.map((item, i) => {
                const extra = bySlug.get(item.slug);
                return (
                  <Animated.View
                    key={item.slug}
                    entering={FadeInDown.delay(Math.min(i, 10) * 40).duration(300)}
                  >
                    <Pressable
                      haptic
                      onPress={() => router.push(`/(app)/explore/${item.slug}` as never)}
                    >
                      <Card style={styles.card}>
                        <View style={styles.cardText}>
                          <View style={styles.titleRow}>
                            <Text variant="title" numberOfLines={1} style={styles.cardTitle}>
                              {item.name}
                            </Text>
                            {extra?.sanskrit_name ? (
                              <Text variant="sanskrit" style={styles.sanskrit} numberOfLines={1}>
                                {extra.sanskrit_name}
                              </Text>
                            ) : null}
                          </View>

                          <Text variant="bodySmall" numberOfLines={2}>
                            {item.desc}
                          </Text>

                          {typeof extra?.connection_count === 'number' ? (
                            <View style={styles.connections}>
                              <View style={styles.dot} />
                              <Text variant="caption">{extra.connection_count} connections</Text>
                            </View>
                          ) : null}
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={theme.colors.textMuted}
                        />
                      </Card>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { marginBottom: theme.spacing(4) },
  section: { marginBottom: theme.spacing(5) },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  list: { gap: theme.spacing(2.5) },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(3) },
  cardText: { flex: 1, gap: theme.spacing(1) },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing(2) },
  cardTitle: { flexShrink: 1 },
  sanskrit: { fontSize: 13, lineHeight: 20, color: theme.colors.textSecondary },
  connections: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(1.5), marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.nodeColors.concept },
});
