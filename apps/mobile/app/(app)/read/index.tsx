import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card, Chip, Pressable, Screen, Skeleton, EmptyState } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { useScriptures } from '@/lib/queries';
import type { Scripture } from '@/lib/api';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'veda', label: 'Vedas' },
  { key: 'upanishad', label: 'Upanishads' },
  { key: 'gita', label: 'Gita' },
  { key: 'purana', label: 'Puranas' },
  { key: 'ramayana', label: 'Ramayana' },
  { key: 'mahabharata', label: 'Mahabharata' },
  { key: 'shastra', label: 'Shastras' },
];

export default function ReadScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('all');
  const { data, isLoading, isError, refetch, isRefetching } = useScriptures();

  const scriptures = useMemo(() => {
    const all = data?.scriptures ?? [];
    const filtered = category === 'all' ? all : all.filter((s) => s.category === category);
    // Readable content first
    return [...filtered].sort((a, b) => b.verse_count - a.verse_count);
  }, [data, category]);

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <ScreenHeader title="Scriptures" subtitle={`${data?.total ?? '…'} sacred texts`} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsWrap}
      >
        {CATEGORIES.map((c) => (
          <Chip key={c.key} label={c.label} active={category === c.key} onPress={() => setCategory(c.key)} />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={92} radius={theme.radius.card} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          emoji="🛰️"
          title="Could not reach VEDA"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : scriptures.length === 0 ? (
        <EmptyState title="No scriptures in this tradition yet" />
      ) : (
        <View style={styles.list}>
          {scriptures.map((scripture, i) => (
            <Animated.View key={scripture.id} entering={FadeInDown.delay(Math.min(i, 8) * 50).duration(350)}>
              <ScriptureCard
                scripture={scripture}
                onPress={() => router.push(`/(app)/read/${scripture.slug}` as never)}
              />
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function ScriptureCard({ scripture, onPress }: { scripture: Scripture; onPress: () => void }) {
  const readable = scripture.verse_count > 0 || scripture.chapter_count > 0;
  return (
    <Pressable haptic onPress={onPress} disabled={!readable}>
      <Card style={[styles.card, !readable && styles.cardMuted]}>
        <View style={styles.cardText}>
          {scripture.sanskrit_name ? (
            <Text variant="sanskrit" style={styles.cardSanskrit} numberOfLines={1}>
              {scripture.sanskrit_name}
            </Text>
          ) : null}
          <Text variant="serif" style={styles.cardName} numberOfLines={1}>
            {scripture.name}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {readable
              ? `${scripture.chapter_count} chapters · ${scripture.verse_count.toLocaleString()} verses`
              : 'Coming soon'}
          </Text>
        </View>
        <View style={[styles.categoryDot, { backgroundColor: categoryColor(scripture.category) }]} />
      </Card>
    </Pressable>
  );
}

function categoryColor(category: string): string {
  switch (category) {
    case 'veda':
      return '#F59E0B';
    case 'upanishad':
      return '#3B82F6';
    case 'gita':
      return theme.colors.primary;
    case 'purana':
      return '#06B6D4';
    case 'ramayana':
      return '#F43F5E';
    case 'mahabharata':
      return '#A855F7';
    case 'shastra':
      return '#10B981';
    default:
      return theme.colors.textMuted;
  }
}

const styles = StyleSheet.create({
  chipsWrap: { marginBottom: theme.spacing(4), flexGrow: 0 },
  chips: { gap: theme.spacing(2) },
  list: { gap: theme.spacing(3) },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(3) },
  cardMuted: { opacity: 0.55 },
  cardText: { flex: 1, gap: 2 },
  cardSanskrit: { fontSize: 13, lineHeight: 20, color: theme.colors.textSecondary },
  cardName: { fontSize: 19 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
});
