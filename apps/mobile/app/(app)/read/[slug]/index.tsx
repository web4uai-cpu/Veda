import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card, Pressable, Screen, Skeleton, EmptyState } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { useScripture, useChapters } from '@/lib/queries';

export default function ScriptureDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const scriptureQ = useScripture(slug);
  const chaptersQ = useChapters(scriptureQ.data?.id);

  const scripture = scriptureQ.data;
  const chapters = chaptersQ.data?.chapters ?? [];
  const loading = scriptureQ.isLoading || chaptersQ.isLoading;

  return (
    <Screen>
      <ScreenHeader title={scripture?.name ?? 'Scripture'} left="back" />

      {scripture ? (
        <Card style={styles.headerCard}>
          {scripture.sanskrit_name ? (
            <Text variant="sanskrit" style={styles.sanskritName}>
              {scripture.sanskrit_name}
            </Text>
          ) : null}
          {scripture.description ? (
            <Text variant="bodySmall" style={styles.description}>
              {scripture.description}
            </Text>
          ) : null}
          <Text variant="caption">
            {scripture.chapter_count} chapters · {scripture.verse_count.toLocaleString()} verses ·{' '}
            {scripture.category}
          </Text>
        </Card>
      ) : null}

      {loading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={84} radius={theme.radius.card} />
          ))}
        </View>
      ) : chapters.length === 0 ? (
        <EmptyState title="Chapters not yet ingested" message="This scripture's text is being prepared." />
      ) : (
        <View style={styles.list}>
          {chapters.map((chapter, i) => (
            <Animated.View key={chapter.id} entering={FadeInDown.delay(Math.min(i, 8) * 40).duration(300)}>
              <Pressable
                haptic
                onPress={() => router.push(`/(app)/read/${slug}/${chapter.chapter_number}` as never)}
              >
                <Card style={styles.chapterCard}>
                  <View style={styles.chapterNumber}>
                    <Text variant="title" color={theme.colors.primary}>
                      {chapter.chapter_number}
                    </Text>
                  </View>
                  <View style={styles.chapterText}>
                    {chapter.sanskrit_title ? (
                      <Text variant="sanskrit" style={styles.chapterSanskrit} numberOfLines={1}>
                        {chapter.sanskrit_title}
                      </Text>
                    ) : null}
                    <Text variant="title" numberOfLines={1}>
                      {chapter.title ?? `Chapter ${chapter.chapter_number}`}
                    </Text>
                    <Text variant="caption">{chapter.verse_count} verses</Text>
                  </View>
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
  headerCard: { marginBottom: theme.spacing(4), gap: theme.spacing(1.5) },
  sanskritName: { fontSize: 16, lineHeight: 26 },
  description: { lineHeight: 20 },
  list: { gap: theme.spacing(3) },
  chapterCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(3) },
  chapterNumber: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterText: { flex: 1, gap: 1 },
  chapterSanskrit: { fontSize: 12, lineHeight: 18, color: theme.colors.textSecondary },
});
