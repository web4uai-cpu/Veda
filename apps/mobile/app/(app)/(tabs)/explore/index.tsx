import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card, Pressable, Screen, Skeleton, EmptyState, Input } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { useConcepts, useGraphStats } from '@/lib/queries';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const conceptsQ = useConcepts();
  const statsQ = useGraphStats();

  const concepts = useMemo(() => {
    const all = conceptsQ.data?.concepts ?? [];
    const sorted = [...all].sort(
      (a, b) => (b.connection_count ?? 0) - (a.connection_count ?? 0),
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.sanskrit_name && c.sanskrit_name.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q)),
    );
  }, [conceptsQ.data, search]);

  const stats = statsQ.data;

  return (
    <Screen refreshing={conceptsQ.isRefetching} onRefresh={conceptsQ.refetch}>
      <ScreenHeader
        title="Explore"
        subtitle={
          stats
            ? `${stats.total_nodes} nodes · ${stats.total_relationships} connections`
            : 'The knowledge graph of Sanatan Dharma'
        }
      />

      <View style={styles.search}>
        <Input value={search} onChangeText={setSearch} placeholder="Search concepts, e.g. dharma…" />
      </View>

      {conceptsQ.isLoading ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="47.7%" height={112} radius={theme.radius.card} />
          ))}
        </View>
      ) : concepts.length === 0 ? (
        <EmptyState
          emoji="🕸️"
          title={search ? `Nothing matches “${search}”` : 'Knowledge graph is being seeded'}
          message={search ? undefined : 'Concepts appear here once Neo4j is connected.'}
        />
      ) : (
        <View style={styles.grid}>
          {concepts.map((concept, i) => (
            <Animated.View
              key={concept.slug}
              entering={FadeInDown.delay(Math.min(i, 10) * 40).duration(300)}
              style={styles.gridItem}
            >
              <Pressable haptic onPress={() => router.push(`/(app)/explore/${concept.slug}` as never)}>
                <Card style={styles.card}>
                  {concept.sanskrit_name ? (
                    <Text variant="sanskrit" style={styles.sanskrit} numberOfLines={1}>
                      {concept.sanskrit_name}
                    </Text>
                  ) : null}
                  <Text variant="title" numberOfLines={1}>
                    {concept.name}
                  </Text>
                  {concept.category ? (
                    <Text variant="caption" color={theme.nodeColors.concept} numberOfLines={1}>
                      {concept.category}
                    </Text>
                  ) : null}
                  {typeof concept.connection_count === 'number' ? (
                    <Text variant="caption">{concept.connection_count} connections</Text>
                  ) : null}
                </Card>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { marginBottom: theme.spacing(4) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(3) },
  gridItem: { width: '47.7%' },
  card: { gap: 3, minHeight: 108 },
  sanskrit: { fontSize: 13, lineHeight: 20, color: theme.colors.textSecondary },
});
